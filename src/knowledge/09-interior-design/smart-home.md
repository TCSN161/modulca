---
id: "smart-home"
title: "Smart Home Integration"
category: "interior-design"
tags: ["interior", "smart-home", "iot", "automation", "home-assistant", "zigbee"]
sources: ["Various smart home technology references"]
difficulty: "intermediate"
lastUpdated: "2026-04-11"
proOnly: false
relatedArticles: ["electrical", "lighting-design"]
---

# Smart Home Integration

## Overview
Smart home technology automates lighting, heating, security, and appliance control for comfort, energy efficiency, and convenience. For modular homes, the key advantage is factory pre-wiring — all smart infrastructure can be installed during manufacturing.

## Smart Home Layers

| Layer | Function | Examples |
|-------|----------|---------|
| Connectivity | Network backbone | Wi-Fi mesh, Zigbee/Z-Wave hub, Ethernet |
| Lighting | Automated lighting control | Smart switches, LED strips, motion sensors |
| Climate | Heating/cooling optimization | Smart thermostat, zone valves, weather-compensated |
| Security | Protection and monitoring | Smart lock, cameras, door/window sensors |
| Energy | Monitoring and optimization | Energy monitor, solar management, battery control |
| Entertainment | Audio/visual | Multi-room audio, TV integration |
| Appliances | Kitchen and laundry | Smart oven, washer notifications |

## Protocol Comparison

| Protocol | Range | Power | Mesh | Best For |
|----------|-------|-------|------|----------|
| Zigbee | 10-20m | Very low | Yes | Sensors, lights, switches |
| Z-Wave | 30m | Low | Yes | Switches, locks, thermostats |
| Wi-Fi | 30-50m | High | No (mesh routers) | Cameras, high-bandwidth |
| Thread/Matter | 15-30m | Very low | Yes | Future standard, cross-platform |
| Bluetooth LE | 10m | Very low | No | Proximity, personal devices |
| Wired (KNX/Ethernet) | Unlimited | — | — | Professional, most reliable |

## Per-Room Smart Features

| Room | Smart Features | Priority |
|------|---------------|----------|
| Entrance | Smart lock, camera, motion light, doorbell | High |
| Living room | Smart lighting (scenes), thermostat, blinds, speakers | High |
| Kitchen | Under-cabinet lighting, extractor auto, leak sensor | Medium |
| Bedroom | Wake-up light, blackout blinds, temperature control | Medium |
| Bathroom | Motion light, heated mirror timer, leak sensor | Medium |
| Home office | Automated lighting (focus/meeting), smart plug | Medium |
| Garden/exterior | Irrigation timer, outdoor lights, security camera | Low-Medium |

## Pre-Wiring Requirements

| Infrastructure | Specification | Notes |
|---------------|---------------|-------|
| CAT6 to each room | 1-2 runs per module | Ethernet for reliability |
| Zigbee hub location | Central module | Hub reaches all modules via mesh |
| Smart switch neutral wire | Required in all switch boxes | Many smart switches need neutral |
| USB power outlets | Kitchen, bedroom, office | Convenient charging |
| Outdoor conduit | Weatherproof, to camera locations | IP66 rated |
| Server/hub location | Utility module | Small home server or hub |

## ModulCA Application
- **Factory pre-wired**: All smart infrastructure installed during manufacturing — neutral wires, CAT6, conduit
- **Per-module hub**: Each module tested for connectivity before leaving factory
- **Zigbee mesh**: Module grid creates natural mesh network — hub in central module
- **Smart lighting factory-set**: Dimmable LED drivers and smart switches installed in each module
- **Energy monitoring**: Per-module energy monitoring — understand consumption by room
- **Future-proof conduit**: Empty conduit runs between modules for future upgrades
- **Home Assistant compatible**: Open-source platform runs on small server in utility module

## References
- Various smart home technology and IoT architecture references
- Thread Group / Connectivity Standards Alliance (Matter standard)
