import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import Papa from "papaparse";
import cytoscape from "cytoscape";

function App() {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [stats, setStats] = useState({ status: "Waiting for file...", nodes: 0, edges: 0 });
  const cyRef = useRef(null);
  const containerRef = useRef(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setStats({ status: "Parsing CSV...", nodes: 0, edges: 0 });

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
      },
      error: (err) => {
        setStats({ status: `Error reading file: ${err.message}`, nodes: 0, edges: 0 });
      }
    });
  };

  const buildGraph = () => {
    if (!data.length || !containerRef.current) return;
    setStats(prev => ({ ...prev, status: "Building radial map..." }));

    const nodes = [];
    const edges = [];

    // 1. Create the Central "YOU" Node
    nodes.push({
      data: { id: "YOU", label: "You", type: "root" }
    });

    const companyMap = {};

    // 2. Group people by their Company/School theme
    data.forEach((person, i) => {
      // Handle variations in column names and default to "Independent" if blank
      let theme = person["Company"] || person["Organization"] || person["School"] || "Independent";
      theme = theme.trim();
      if (!theme) theme = "Independent";
      
      if (!companyMap[theme]) companyMap[theme] = [];
      companyMap[theme].push({ ...person, originalIndex: i });
    });

    // 3. Build the Hubs (Themes) and Spokes (People)
    Object.keys(companyMap).forEach((themeName, index) => {
      const themeId = `theme_${index}`; // Create a safe ID string
      
      // Create the Theme/Company Hub Node
      nodes.push({
        data: { id: themeId, label: themeName, type: "theme" }
      });
      
      // Connect "YOU" to the Theme Hub
      edges.push({
        data: { id: `e_you_${themeId}`, source: "YOU", target: themeId }
      });

      // Create individual people and connect them to their Theme Hub
      companyMap[themeName].forEach(person => {
        const personId = `person_${person.originalIndex}`;
        const fName = person["First Name"] || person["FirstName"] || "";
        const lName = person["Last Name"] || person["LastName"] || "";
        
        nodes.push({
          data: {
            id: personId,
            label: `${fName} ${lName}`.trim() || "Unknown",
            type: "person"
          }
        });
        
        // Connect Person to Theme
        edges.push({
          data: { id: `e_${themeId}_${personId}`, source: themeId, target: personId }
        });
      });
    });

    setStats({ status: "Map Rendered successfully!", nodes: nodes.length, edges: edges.length });

    if (cyRef.current) cyRef.current.destroy();

    // 4. Initialize Cytoscape with Tiered Styling
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: [...nodes, ...edges],
      style: [
        // --- BASE NODE STYLING BY TIER ---
        {
          selector: 'node[type="root"]',
          style: {
            "width": 60,
            "height": 60,
            "background-color": "#a882ff", // Vibrant purple for you
            "label": "data(label)",
            "color": "#ffffff",
            "font-size": "16px",
            "font-weight": "bold",
            "text-valign": "bottom",
            "text-margin-y": 8,
            "text-opacity": 1 // Always show your label
          }
        },
        {
          selector: 'node[type="theme"]',
          style: {
            "width": 35,
            "height": 35,
            "background-color": "#4db6ac", // Teal for companies/schools
            "label": "data(label)",
            "color": "#4db6ac",
            "font-size": "14px",
            "font-weight": "bold",
            "text-valign": "bottom",
            "text-margin-y": 6,
            "text-opacity": 1 // Always show theme labels
          }
        },
        {
          selector: 'node[type="person"]',
          style: {
            "width": 15,
            "height": 15,
            "background-color": "#8b9eb7", // Muted slate for people
            "label": "data(label)",
            "color": "#e0e0e0",
            "font-size": "12px",
            "text-valign": "bottom",
            "text-margin-y": 4,
            "text-opacity": 0, // Hidden by default
            "transition-property": "background-color, text-opacity, width, height",
            "transition-duration": 200
          }
        },
        // --- BASE EDGE STYLING ---
        {
          selector: "edge",
          style: {
            "width": 1.5,
            "line-color": "#444444",
            "opacity": 0.5,
            "curve-style": "bezier"
          }
        },
        // --- INTERACTIVE HOVER STATES ---
        {
          selector: "node.hover",
          style: {
            "background-color": "#a882ff",
            "text-opacity": 1,
            "font-weight": "bold",
            "z-index": 10
          }
        },
        {
          selector: "node.dim",
          style: {
            "opacity": 0.2
          }
        },
        {
          selector: "edge.hover",
          style: {
            "line-color": "#a882ff",
            "opacity": 0.9,
            "width": 2.5,
            "z-index": 10
          }
        },
        {
          selector: "edge.dim",
          style: {
            "opacity": 0.1
          }
        }
      ],
      layout: {
        name: "cose",
        idealEdgeLength: 80,
        nodeOverlap: 20,
        refresh: 20,
        fit: true,
        padding: 50,
        randomize: true,
        componentSpacing: 100,
        nodeRepulsion: 400000, // Strong push to spread the circle out
        edgeElasticity: 50,
        nestingFactor: 1.2,
        gravity: 40,
        numIter: 1000,
        animate: true
      }
    });

    const cy = cyRef.current;

    // Interactive Hover Logic
    cy.on('mouseover', 'node', function(e) {
      const node = e.target;
      const neighborhood = node.neighborhood().add(node);
      cy.elements().addClass('dim');
      neighborhood.removeClass('dim');
      neighborhood.addClass('hover');
    });

    cy.on('mouseout', 'node', function(e) {
      cy.elements().removeClass('dim hover');
    });
  };

  useEffect(() => {
    buildGraph();
  }, [data]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div style={{ 
        position: "absolute", 
        top: 20, 
        left: 20, 
        zIndex: 10, 
        background: "rgba(30, 30, 30, 0.9)", 
        padding: "15px", 
        borderRadius: "8px",
        border: "1px solid #444",
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        minWidth: "250px"
      }}>
        <h2 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "600" }}>Obsidian Graph</h2>
        <label style={{
          background: "#2a2a2a",
          border: "1px solid #555",
          padding: "8px 12px",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          display: "block",
          textAlign: "center",
          marginBottom: "10px"
        }}>
          {fileName ? `Loaded: ${fileName}` : "Upload Connections.csv"}
          <input 
            type="file" 
            accept=".csv" 
            onChange={handleUpload} 
            style={{ display: "none" }} 
          />
        </label>
        
        <div style={{ fontSize: "12px", color: "#aaa", borderTop: "1px solid #444", paddingTop: "10px" }}>
          <div style={{ marginBottom: "4px", color: stats.status.includes("Error") ? "#ff6b6b" : "#4ade80" }}>
            <strong>Status:</strong> {stats.status}
          </div>
          <div><strong>Total Entities:</strong> {stats.nodes}</div>
          <div><strong>Web Connections:</strong> {stats.edges}</div>
        </div>
      </div>

      <div 
        ref={containerRef} 
        style={{ flex: 1, width: "100%", height: "100%", background: "#1e1e1e" }} 
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

