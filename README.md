<a name="readme-top"></a>

## About The Project

<div align="center"> 
<img width="497" alt="insert-zero-extension" src="https://github.com/user-attachments/assets/471465d6-41e1-4528-a367-5865650ed873">
</div>

Insert Zero Extension is a browser extension designed to automate the process of inserting missing grades in a Canvas gradebook. It scans the gradebook, identifies missing entries, and updates them with a default value of zero. This extension enhances efficiency for educators and administrators by automating manual grade adjustments.

## Features

- Automatically scrolls through the Canvas gradebook to detect missing grades.
- Updates missing grades with zero.
- Provides a visual loading bar for progress tracking.
- Saves the access token for convenience.
- Includes a refresh button to reset the extension’s state.

## Getting Started

This guide provides the necessary steps to set up and use the Insert Zero Extension.

### Prerequisites

Before using the extension, ensure you have:

- **Google Chrome** or a compatible Chromium-based browser.
- **Developer mode enabled** in Chrome Extensions.

### Installation

1. **Clone the Repository**  
   Clone the repository to your local machine:

   ```bash
   git clone https://github.com/p-gatsby/insert-zero-extension.git
   ```

2. **Load the Extension in Chrome**
   - Open **Google Chrome** and navigate to `chrome://extensions/`.
   - Enable **Developer Mode** (toggle in the top right).
   - Click **"Load unpacked"** and select the cloned repository folder.

### Usage

1. **Open Canvas Gradebook**

   - Navigate to your Canvas course gradebook.

2. **Start the Extension**

   - Click on the Insert Zero Extension icon in the browser toolbar.
   - Enter your **Canvas Access Token** and **Course ID**.
   - Click **"Start Search"** to begin scanning the gradebook.

3. **Auto-Scroll and Update Process**

   - The extension will scroll through the gradebook to detect missing grades.
   - Once detected, the **Save Grades** button will appear.
   - Click **"Save Grades"** to update missing grades to zero.

4. **Completion**
   - The progress bar will track the update process.
   - Upon completion, the **Refresh** button will appear to reset the extension’s state.

### Configuration

The extension requires an **Access Token** to authenticate with Canvas. You can generate one in your **Canvas account settings**. The token can be saved locally for convenience.

### Development

To modify the extension, follow these steps:

1. **Make changes to the JavaScript and manifest files** as needed.
2. **Reload the extension in Chrome:**
   - Navigate to `chrome://extensions/`
   - Click **"Reload"** on the Insert Zero Extension.

### License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>
