# LinkedIn Connections Graph view

<img width="1295" height="623" alt="cropped image" src="https://github.com/user-attachments/assets/b93cd0d0-a2b9-4230-b3a4-5b1de8ff1bb5" />


A local desktop application that transforms your standard LinkedIn network into an interactive, physics-driven, Obsidian-style knowledge graph. See how your network is clustered by companies, schools, and organizations in real-time.

## Features
* **100% Local & Private:** Your data never leaves your computer. The app processes the CSV entirely locally.
* **Hub & Spoke Architecture:** Groups your connections automatically by Company or School.
* **Obsidian-Style Interactivity:** Hover over nodes to isolate specific networks and dim the rest of the graph.
* **Physics Engine:** Uses Cytoscape.js to dynamically balance and spread out your network clusters.

## 🚀 Quick Start

### 1. Prerequisites
You will need [Node.js](https://nodejs.org/) installed on your computer.

### 2. Get Your Data from LinkedIn

To use this app, you need to export your "Connections" data from LinkedIn. **Your data is completely private and never leaves your computer.**

1. Log into [LinkedIn](https://www.linkedin.com/) on a web browser.
2. Click your profile picture (**Me** icon) in the top right corner and select **Settings & Privacy**.
3. On the left sidebar, click **Data privacy**.
4. Under the *How LinkedIn uses your data* section, click **Get a copy of your data**.
5. Select the second option: **"Want something in particular? Select the data files you're most interested in."**
6. Check the box for **Connections**.
7. Click the **Request archive** button.
8. LinkedIn will process this and email you a link to download a `.zip` file (this usually takes about 10 minutes).
9. Extract the downloaded `.zip` file. Inside, you will find your `Connections.csv` file. Keep this handy!

---

### 3. Installation
Clone this repository and install the dependencies:

```bash
git clone [https://github.com/YOUR_USERNAME/linkedin-obsidian-graph.git](https://github.com/YOUR_USERNAME/linkedin-obsidian-graph.git)
cd linkedin-obsidian-graph
npm install

```
### 4. How to Run

```bash
npm start

```
This worked for me, but you may need some extra dependencies

### 5. Troubleshooting
*Check the CSV file, LinkedIn adds a few extra rows to the top of the CSV file causing the app to not recognize it. Delete those rows before uploading the file to the app
*If running slowly, close other apps to make the program run faster,
  optimized version is on the way

Enjoy!!

This project was created with the help of google Gemini

