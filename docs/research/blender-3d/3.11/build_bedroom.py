"""3.11 bedroom set — real-size PBR models, built in Blender 5.3 through MCP.

Run inside Blender (MCP execute_blender_code):  exec(open(PATH).read()); build(<piece>)
Units: metres. Blender frame: X = width, -Y = front (→ glTF +Z, the kit/renderer front),
Z up, origin bottom-centre. Sizes match src/features/design/layouts.ts bedroom/rest slots.
"""
import bpy, bmesh, math
import numpy as np

OUT = r"C:\Users\Costin\Documents\modulca\docs\research\blender-3d\3.11"

# ---------------------------------------------------------------- textures
def wood_image(size=1024):
    name = "T_wood_oak"
    if name in bpy.data.images:
        return bpy.data.images[name]
    u = np.linspace(0, 1, size, endpoint=False)
    U, V = np.meshgrid(u, u)
    tau = 2 * math.pi
    # tileable: only integer frequencies in u and v
    warp = (0.010 * np.sin(tau * (2 * U + 0.3)) + 0.006 * np.sin(tau * (5 * U + 3 * V))
            + 0.004 * np.sin(tau * (11 * U - 2 * V + 0.7)))
    rings = 0.5 + 0.5 * np.sin(tau * (36 * V + 12 * warp))
    fine = 0.5 + 0.5 * np.sin(tau * (160 * V + 1.5 * np.sin(tau * 7 * U)))
    t = np.clip(0.65 * rings ** 2.2 + 0.2 * fine, 0, 1)
    light = np.array([0.62, 0.47, 0.33]); dark = np.array([0.47, 0.33, 0.22])
    rgb = light[None, None, :] * (1 - t[..., None]) + dark[None, None, :] * t[..., None]
    rgba = np.concatenate([rgb, np.ones((size, size, 1))], axis=2).astype(np.float32)
    img = bpy.data.images.new(name, size, size, alpha=False)
    img.pixels.foreach_set(rgba.ravel())
    img.pack()
    return img

# ---------------------------------------------------------------- materials
def gltf_group():
    name = "glTF Material Output"
    ng = bpy.data.node_groups.get(name)
    if ng:
        return ng
    ng = bpy.data.node_groups.new(name, "ShaderNodeTree")
    ng.interface.new_socket(name="Occlusion", in_out="INPUT", socket_type="NodeSocketFloat")
    ng.nodes.new("NodeGroupInput")
    return ng

SPEC = {  # base colour (linear), roughness, metallic, wood texture?
    "wood":   ((0.60, 0.44, 0.30), 0.55, 0.0, True),
    "wood_dark": ((0.16, 0.11, 0.08), 0.6, 0.0, False),
    "linen":  ((0.86, 0.84, 0.80), 0.9, 0.0, False),
    "fabric": ((0.34, 0.40, 0.42), 0.95, 0.0, False),   # duvet, blue-grey
    "uphol":  ((0.52, 0.50, 0.47), 0.95, 0.0, False),   # headboard pad, warm grey
    "metal":  ((0.55, 0.55, 0.56), 0.35, 1.0, False),
}

def make_mat(piece, kind, ao_img):
    name = f"{piece}_{kind}"
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    col, rough, metal, tex = SPEC[kind]
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    p = nt.nodes.new("ShaderNodeBsdfPrincipled")
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    nt.links.new(p.outputs["BSDF"], out.inputs["Surface"])
    if tex:
        t = nt.nodes.new("ShaderNodeTexImage"); t.image = wood_image()
        uv1 = nt.nodes.new("ShaderNodeUVMap"); uv1.uv_map = "UVMap"
        nt.links.new(uv1.outputs["UV"], t.inputs["Vector"])
        nt.links.new(t.outputs["Color"], p.inputs["Base Color"])
    else:
        p.inputs["Base Color"].default_value = (*col, 1)
    # AO (UV2) → glTF occlusion; also the active node = bake target
    ao = nt.nodes.new("ShaderNodeTexImage"); ao.image = ao_img; ao.name = "AO"
    uv2 = nt.nodes.new("ShaderNodeUVMap"); uv2.uv_map = "UV2"
    nt.links.new(uv2.outputs["UV"], ao.inputs["Vector"])
    sep = nt.nodes.new("ShaderNodeSeparateColor")
    nt.links.new(ao.outputs["Color"], sep.inputs["Color"])
    g = nt.nodes.new("ShaderNodeGroup"); g.node_tree = gltf_group()
    nt.links.new(sep.outputs[0], g.inputs["Occlusion"])
    nt.nodes.active = ao
    return m

# ---------------------------------------------------------------- geometry
def box(name, x0, x1, y0, y1, z0, z1, mat, bevel=0.005, seg=2, coll=None):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts:
        v.co.x = (x0 + x1) / 2 + v.co.x * (x1 - x0)
        v.co.y = (y0 + y1) / 2 + v.co.y * (y1 - y0)
        v.co.z = (z0 + z1) / 2 + v.co.z * (z1 - z0)
    bm.to_mesh(me); bm.free()
    for poly in me.polygons:
        poly.use_smooth = True
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    coll.objects.link(ob)
    if bevel > 0:
        b = ob.modifiers.new("Bevel", "BEVEL")
        b.width = bevel; b.segments = seg; b.limit_method = "ANGLE"; b.harden_normals = True
    wn = ob.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL"); wn.keep_sharp = True
    return ob

def bake_piece(piece, parts, coll, ao_img, samples=96):
    """apply modifiers, join, UV1 cube (1 tile = 1 m), UV2 smart-project, bake AO."""
    vl = bpy.context.view_layer
    for o in vl.objects:
        o.select_set(False)
    for o in parts:
        o.select_set(True)
    vl.objects.active = parts[0]
    with bpy.context.temp_override(selected_editable_objects=parts, active_object=parts[0]):
        bpy.ops.object.convert(target="MESH")          # applies Bevel + WeightedNormal
        bpy.ops.object.join()
    ob = vl.objects.active
    ob.name = piece; ob.data.name = piece
    # UVs
    me = ob.data
    if "UV2" not in me.uv_layers:
        me.uv_layers.new(name="UVMap") if not me.uv_layers else None
        me.uv_layers.new(name="UV2")
    bpy.ops.object.mode_set(mode="EDIT")
    bpy.ops.mesh.select_all(action="SELECT")
    me.uv_layers.active = me.uv_layers["UVMap"]
    bpy.ops.uv.cube_project(cube_size=1.0, correct_aspect=True, scale_to_bounds=False)
    me.uv_layers.active = me.uv_layers["UV2"]
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.01, scale_to_bounds=True)
    bpy.ops.object.mode_set(mode="OBJECT")
    # bake AO into UV2
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "OPTIX"; prefs.get_devices()
        for d in prefs.devices:
            d.use = d.type in ("OPTIX",)
        sc.cycles.device = "GPU"
    except Exception:
        sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.render.bake.margin = 8
    bpy.ops.object.bake(type="AO")
    ao_img.pack()
    me.uv_layers.active = me.uv_layers["UVMap"]
    return ob

def tri_count(ob):
    ob.data.calc_loop_triangles()
    return len(ob.data.loop_triangles)

def export(ob, fname):
    loc = ob.location.copy(); ob.location = (0, 0, 0)
    vl = bpy.context.view_layer
    for o in vl.objects:
        o.select_set(False)
    ob.select_set(True); vl.objects.active = ob
    path = f"{OUT}\\{fname}"
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True,
                              export_yup=True, export_apply=True, export_texcoords=True,
                              export_normals=True, export_image_format="AUTO")
    ob.location = loc
    return path

# ---------------------------------------------------------------- pieces
def piece_setup(piece, ao_size):
    coll = bpy.data.collections.get(f"MCA_3.11_{piece}") or bpy.data.collections.new(f"MCA_3.11_{piece}")
    if coll.name not in bpy.context.scene.collection.children:
        bpy.context.scene.collection.children.link(coll)
    for o in list(coll.objects):
        bpy.data.objects.remove(o)
    img_name = f"AO_{piece}"
    if img_name in bpy.data.images:
        bpy.data.images.remove(bpy.data.images[img_name])
    ao = bpy.data.images.new(img_name, ao_size, ao_size, alpha=False)
    ao.generated_color = (1, 1, 1, 1)
    M = {k: make_mat(piece, k, ao) for k in SPEC}
    return coll, ao, M

def bed():  # bed-double-140: 1.40 × 2.00, headboard 0.95
    piece = "bed-double-140"
    c, ao, M = piece_setup(piece, 1024)
    P = []
    for x in (-0.62, 0.62):
        for y in (-0.92, 0.86):
            P.append(box("leg", x - 0.03, x + 0.03, y - 0.03, y + 0.03, 0, 0.12, M["wood_dark"], 0.004, 1, c))
    P.append(box("frame", -0.70, 0.70, -1.00, 0.94, 0.12, 0.30, M["wood"], 0.008, 2, c))
    P.append(box("headboard", -0.70, 0.70, 0.94, 1.00, 0.0, 0.95, M["wood"], 0.008, 2, c))
    P.append(box("headpad", -0.64, 0.64, 0.90, 0.94, 0.42, 0.90, M["uphol"], 0.018, 3, c))
    P.append(box("mattress", -0.68, 0.68, -0.98, 0.90, 0.30, 0.50, M["linen"], 0.035, 3, c))
    P.append(box("duvet", -0.70, 0.70, -1.00, 0.38, 0.36, 0.545, M["fabric"], 0.03, 3, c))
    for x in (-0.32, 0.32):
        P.append(box("pillow", x - 0.28, x + 0.28, 0.52, 0.86, 0.50, 0.64, M["linen"], 0.05, 4, c))
    return bake_piece(piece, P, c, ao), ao

def nightstand():  # nightstand-45: 0.45 × 0.40 × 0.50
    piece = "nightstand-45"
    c, ao, M = piece_setup(piece, 512)
    P = [
        box("plinth", -0.20, 0.20, -0.15, 0.18, 0.0, 0.08, M["wood_dark"], 0.003, 1, c),
        box("body", -0.225, 0.225, -0.17, 0.20, 0.08, 0.50, M["wood"], 0.004, 2, c),
        box("drawer_top", -0.21, 0.21, -0.185, -0.17, 0.295, 0.485, M["wood"], 0.003, 2, c),
        box("drawer_low", -0.21, 0.21, -0.185, -0.17, 0.095, 0.280, M["wood"], 0.003, 2, c),
        box("handle_top", -0.06, 0.06, -0.20, -0.185, 0.445, 0.457, M["metal"], 0.003, 1, c),
        box("handle_low", -0.06, 0.06, -0.20, -0.185, 0.240, 0.252, M["metal"], 0.003, 1, c),
    ]
    return bake_piece(piece, P, c, ao), ao

def wardrobe():  # wardrobe-80: 0.80 × 0.50 × 2.20, 2 doors
    piece = "wardrobe-80"
    c, ao, M = piece_setup(piece, 1024)
    P = [
        box("plinth", -0.38, 0.38, -0.21, 0.23, 0.0, 0.06, M["wood_dark"], 0.003, 1, c),
        box("carcass", -0.40, 0.40, -0.23, 0.25, 0.06, 2.20, M["wood"], 0.005, 2, c),
        box("door_l", -0.397, -0.003, -0.245, -0.23, 0.07, 2.19, M["wood"], 0.004, 2, c),
        box("door_r", 0.003, 0.397, -0.245, -0.23, 0.07, 2.19, M["wood"], 0.004, 2, c),
        box("handle_l", -0.040, -0.026, -0.26, -0.245, 0.95, 1.35, M["metal"], 0.003, 1, c),
        box("handle_r", 0.026, 0.040, -0.26, -0.245, 0.95, 1.35, M["metal"], 0.003, 1, c),
    ]
    ob = bake_piece(piece, P, c, ao)
    # vertical grain on the tall doors: swap u/v of UV1 (UV2/AO untouched)
    uv = ob.data.uv_layers["UVMap"].data
    for d in uv:
        d.uv = (d.uv[1], d.uv[0])
    return ob, ao

def build(name):
    ob, ao = {"bed": bed, "nightstand": nightstand, "wardrobe": wardrobe}[name]()
    d = ob.dimensions
    info = {"piece": ob.name, "tris": tri_count(ob), "dims_xyz_m": [round(d.x, 3), round(d.y, 3), round(d.z, 3)],
            "mats": [m.name for m in ob.data.materials]}
    info["glb"] = export(ob, f"{ob.name}.raw.glb")
    return info
