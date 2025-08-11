# 🧟 Abandoned House: VR Zombies

A WebXR zombie survival game built for Meta Quest 3 using A-Frame. Fight waves of zombies in an abandoned house using VR controllers!

![WebXR Zombies Game](https://img.shields.io/badge/WebXR-VR%20Game-blue) ![A-Frame](https://img.shields.io/badge/A--Frame-1.5.0-orange) ![Quest 3](https://img.shields.io/badge/Meta-Quest%203-green)

## 🎮 Game Features

- **VR Wave Survival**: Fight increasingly difficult waves of zombies
- **Realistic Gun Mechanics**: Shoot, reload, and manage ammunition
- **Headshot System**: Aim for zombie heads for double damage and bonus points
- **Power-ups**: Collect Insta-Kill and Max Ammo power-ups
- **Atmospheric Environment**: Moody lighting with flickering bulb effects
- **Progressive Difficulty**: Each wave brings more zombies with increased health and speed

## 🕹️ Controls

### VR Controllers (Quest 3)
- **Left Stick**: Move around
- **Right Stick**: Turn/look around
- **Right Trigger (RT)**: Shoot
- **A Button**: Reload weapon
- **Left Stick Click**: Sprint

### Desktop/Mobile (Fallback)
- Mouse to look around
- Click to interact with UI elements

## 🎯 Gameplay

### Objective
Survive as many waves as possible by eliminating zombies before they reach you.

### Scoring
- **Body Shot**: 10 points
- **Headshot**: 20 points (2x damage)
- **Power-up Collection**: Strategic advantage

### Health System
- Start with 100 HP
- Zombies deal 6 damage per hit
- Game over when HP reaches 0

### Wave Progression
- Each wave spawns more zombies (starting at 6, increasing by 2 per wave, max 60)
- Zombie speed increases each wave
- Zombie health increases each wave

### Power-ups (16% drop chance)
- **🔴 Insta-Kill** (Red): One-shot any zombie for 7 seconds
- **🔵 Max Ammo** (Blue): Refill ammunition and magazine for 5 seconds

## 🛠️ Technical Details

### Built With
- **A-Frame 1.5.0**: WebXR framework
- **A-Frame Extras 7.7.0**: Additional components
- **Three.js**: 3D graphics (included with A-Frame)
- **WebXR**: VR/AR web standard

### Features
- Physically correct lighting
- Real-time shadows
- Exponential fog for atmosphere
- 3D spatial audio
- Hand tracking support
- Responsive 2D UI overlay

### Performance
- Optimized for Quest 3 hardware
- Efficient raycasting for shooting
- Smart enemy management
- Minimal draw calls with simple geometry

## 🚀 Getting Started

### Requirements
- Meta Quest 3 (recommended) or any WebXR-compatible headset
- Modern web browser with WebXR support
- Local web server for development

### Installation
1. Clone or download this repository
2. Serve the files using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve
   
   # Using PHP
   php -S localhost:8000
   ```
3. Open your browser and navigate to `localhost:8000`
4. Put on your VR headset and click "Enter VR"

### Development Setup
```bash
# Simple local server options
npm install -g live-server
live-server

# Or use any static file server
```

## 🎨 Game Architecture

### Components
- **`zombie`**: AI behavior, health, damage, and animation
- **`gun`**: Shooting mechanics, reloading, and ammo management
- **`powerup`**: Collectible items with temporary effects
- **`game-manager`**: Core game loop, wave management, and state

### Game States
- **Menu**: Initial start screen
- **Playing**: Active gameplay
- **Game Over**: End screen with final score

## 🔧 Customization

### Difficulty Tuning
Modify these values in the code:
```javascript
// Zombie spawn count per wave
const count = Math.min(6+(this.wave-1)*2, 60);

// Base zombie speed
const base = .58+(this.wave-1)*.06;

// Player damage per zombie hit
this.hp -= 6;

// Starting ammo
this.mag = 10; this.res = 60;
```

### Visual Customization
- Modify zombie colors in the `zombie` component
- Adjust lighting intensity and colors
- Change fog density and color
- Customize UI styling in the `<style>` section

## 🐛 Known Issues

- Desktop fallback controls are limited (VR recommended)
- Some browsers may require HTTPS for WebXR features
- Performance may vary on older devices

## 📱 Browser Compatibility

- **Quest 3 Browser**: ✅ Full support
- **Chrome/Edge**: ✅ Desktop mode, VR with compatible headset
- **Firefox**: ✅ Desktop mode, limited VR support
- **Safari**: ⚠️ Limited WebXR support

## 🤝 Contributing

Feel free to submit issues and pull requests! Some areas for improvement:
- Additional zombie types
- More power-up varieties
- Sound effects and music
- Advanced weapons
- Multiplayer support

## 📄 License

This project is open source. Feel free to use and modify as needed.

## 🎯 Tips for Players

1. **Aim for the head**: Headshots deal double damage and give more points
2. **Manage ammunition**: Don't waste shots, reload strategically
3. **Use cover**: Hide behind furniture when reloading
4. **Collect power-ups**: They can save you in tough situations
5. **Keep moving**: Don't let zombies surround you
6. **Watch the wave counter**: Prepare for increasing difficulty

---

**Enjoy the apocalypse! 🧟‍♂️**
