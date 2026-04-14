# Flux Screensaver

**Author:** Malkio
**Website:** [Malkio.com](https://Malkio.com)
**X (Twitter):** [@malkio](https://x.com/malkio)

---

## What is Flux?
Flux represents a completely reimagined approach to a desktop screen saver, focusing on productivity awareness without sacrificing aesthetics. Hand-crafted as a premium flip-clock style screensaver for Windows, Flux is designed to keep you centered and informed. Whether you need an elegant timepiece to stylize your idle computer, or you want a persistent reminder of time's passing to stay hyper-focused, Flux adapts directly to your exact needs.

Unlike rigid, minimal screensavers, Flux empowers you with immense flexibility. Want a classic full-screen flip-clock? You've got it. Want a countdown to the end of the day wrapped in an ambient background image that pushes your aesthetic further? Flux does that too.

## Core Features Breakdown

### 🕰️ Stunning 3D Flip Clock
- Rendered in a modern, slick, 3D animated flip-card style. 
- Fully respects 12-hour (AM/PM) and 24-hour formats.
- **Micro-animations:** Complete control over the speed and drama of each digit's flip mechanism, delivering satisfying real-time motion.
- **Seconds toggle:** Let every second count or turn it off for a more relaxed minute-by-minute rhythm.

### ⏳ The 1440 Countdown
Your secret weapon for daily focus.
- 1440 represent the number of minutes in a day. The 1440 Countdown visualizes exactly how much of your day is remaining.
- Choose whether to display it in raw minutes or a standard clock format.
- **The Zero-Pulse Effect:** As digits hit absolute zero (0, 00, 000), they begin a rhythmic red pulse. Customize the speed of the pulsing or toggle it off based on your preference.

### 🎨 Total Customization Control
Every user has a different setup. Flux respects that with deep layout precision.
- **Dual Display Adjustments:** Independently show or hide the Clock and the 1440 Countdown. Choose which goes on top, position them vertically, and define the pixel gap spacing between them.
- **Sizing & Scale:** Easily scale your timepieces up and down via fluid sliders.
- **Brightness & Color Settings:** Independent brightness controls over the Clock and the Countdown, plus real-time color picking for text and card backgrounds.

### 📊 Awareness Tracking
- **Last Active / Session Duration:** Subtle, optional widgets that float persistently to show precisely how long you were last active before your computer idled and how long the current screensaver session has been running. (Shows dynamically what time you stepped away!)

### 🖼️ Aesthetic Environments
Turn your idle computer into a centerpiece. 
- Build a solid, minimal color background.
- Apply a slick, animated Grid overlay effect.
- Import stunning **local image wallpapers** seamlessly to blend Flux into your setup.

---

## User Guide & Help Materials

### Installation
1. Locate the downloaded `Flux_Screensaver.scr` file.
2. Right-click the `.scr` file and select **Install** from the context menu. This will open the Windows Screen Saver Settings panel.
3. In the Screen Saver dropdown, ensure **Flux Screensaver** is selected.
4. Click **Apply** and then **OK**.

### Configuring Your Settings
1. Open the Windows Screen Saver Settings panel (search for "Change screen saver" in the Windows start menu).
2. Select **Flux Screensaver** and click **Settings...**
3. A beautiful, native Configuration Window will launch, featuring a live preview of your screensaver as it would look on your actual desktop!
4. Adjust sliders, toggles, and colors. Changes are instantly visible in the preview.
5. Click **Save & Exit** when satisfied.

### Keyboard Shortcuts
- **Mouse Movement / Any Keypress:** Naturally exits the screensaver.
- **Esc Key:** Immediately closes the screensaver process and logs your session analytics.

---

## Version Changelog

### v2.0.0 (Latest)
- **Prepared for Distribution:** Official binary release setup, distribution-ready packaging.
- **Zero-Pulse Feature:** Added dynamic rhythmic red pulsing when the 1440 Countdown reaches leading zeros, complete with adjustable pulse speed settings.
- **Session Info Fixes:** Enhanced tracking logic to guarantee `Last Active` duration captures seamlessly.
- **Image Import Upgrades:** Fixed rigid cross-platform string logic to perfectly handle pulling in any local system images for custom backgrounds.
- **Animation Refinements:** Cleaned up logic bugs on the digit cards flipping over perfectly. Speed controls expanded for flip-drop timings.

### v1.0.3
- Stable Release of major codebase.
- Improved 1440 layout parameters and visual logic separating it from standard Clock layout.

### v1.0.0
- Initial Project creation.
- Basic Electron and Vite-React bootstrapping.
- Base flip-clock visual implementation.
