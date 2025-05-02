// Sample data - links grouped by topic
const linkGroups = [
  {
    topic: "Productivity",
    links: [
      {
        title: "Notion",
        description:
          "All-in-one workspace for notes, tasks, wikis, and databases.",
        url: "https://www.notion.so/",
      },
      {
        title: "Trello",
        description: "Visual tool for organizing your work and life.",
        url: "https://trello.com/",
      },
      {
        title: "Todoist",
        description: "The to-do list to organize work & life.",
        url: "https://todoist.com/",
      },
    ],
  },
  {
    topic: "Development",
    links: [
      {
        title: "GitHub",
        description:
          "GitHub is where over 100 million developers shape the future of software.",
        url: "https://github.com/",
      },
      {
        title: "MDN Web Docs",
        description: "Resources for developers, by developers.",
        url: "https://developer.mozilla.org/",
      },
      {
        title: "VS Code",
        description: "Code editing. Redefined.",
        url: "https://code.visualstudio.com/",
      },
    ],
  },
  {
    topic: "Design",
    links: [
      {
        title: "Figma",
        description: "Collaborative interface design tool.",
        url: "https://www.figma.com/",
      },
      {
        title: "Dribbble",
        description: "Discover the world's top designers & creatives.",
        url: "https://dribbble.com/",
      },
      {
        title: "Unsplash",
        description: "Beautiful, free images and photos.",
        url: "https://unsplash.com/",
      },
    ],
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  // Create header
  const header = document.createElement("header");
  header.className = "header";

  const title = document.createElement("h1");
  title.textContent = "Bookmarks";
  title.className = "title";

  const subTitle = document.createElement("p");
  subTitle.textContent = "A collection of useful resources";
  subTitle.className = "subtitle";

  header.appendChild(title);
  header.appendChild(subTitle);

  // Create search bar
  const searchContainer = document.createElement("div");
  searchContainer.className = "search-container";

  const searchIcon = document.createElement("span");
  searchIcon.className = "search-icon";
  searchIcon.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#6b7280"/>
      </svg>
    `;

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.placeholder = "Search bookmarks...";
  searchInput.className = "search-input";

  searchContainer.appendChild(searchIcon);
  searchContainer.appendChild(searchInput);

  // Create main content
  const mainContent = document.createElement("main");
  mainContent.className = "main-content";

  // Function to render all link groups
  const renderAllLinkGroups = () => {
    mainContent.innerHTML = "";

    linkGroups.forEach((group) => {
      const groupSection = createGroupSection(group);
      mainContent.appendChild(groupSection);
    });
  };

  // Create a group section
  const createGroupSection = (group) => {
    const groupSection = document.createElement("section");
    groupSection.className = "group-section";

    const groupTitle = document.createElement("h2");
    groupTitle.className = "group-title";
    groupTitle.textContent = group.topic;

    const linkContainer = document.createElement("div");
    linkContainer.className = "link-container";

    group.links.forEach((link) => {
      const linkCard = createLinkCard(link);
      linkContainer.appendChild(linkCard);
    });

    groupSection.appendChild(groupTitle);
    groupSection.appendChild(linkContainer);

    return groupSection;
  };

  // Create a link card
  const createLinkCard = (link) => {
    const linkElement = document.createElement("div");
    linkElement.className = "link-card";
    linkElement.dataset.title = link.title.toLowerCase();
    linkElement.dataset.description = link.description.toLowerCase();

    const linkTitle = document.createElement("h3");
    linkTitle.className = "link-title";

    const linkAnchor = document.createElement("a");
    linkAnchor.href = link.url;
    linkAnchor.textContent = link.title;
    linkAnchor.target = "_blank";
    linkAnchor.rel = "noopener noreferrer";

    linkTitle.appendChild(linkAnchor);

    const linkDescription = document.createElement("p");
    linkDescription.className = "link-description";
    linkDescription.textContent = link.description;

    const linkUrl = document.createElement("div");
    linkUrl.className = "link-url";

    const urlText = document.createElement("span");
    urlText.textContent = link.url;

    linkUrl.appendChild(urlText);

    linkElement.appendChild(linkTitle);
    linkElement.appendChild(linkDescription);
    linkElement.appendChild(linkUrl);

    linkElement.onclick = (e) => {
      console.log("i have been clicked");
      linkAnchor.click();
      e.stopPropagation();
    };

    return linkElement;
  };

  // Search functionality
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    if (searchTerm === "") {
      renderAllLinkGroups();
      return;
    }

    mainContent.innerHTML = "";

    // Create a section for search results
    const resultsSection = document.createElement("section");
    resultsSection.className = "group-section";

    const resultsTitle = document.createElement("h2");
    resultsTitle.className = "group-title";
    resultsTitle.textContent = "Search Results";

    const resultsContainer = document.createElement("div");
    resultsContainer.className = "link-container";

    let resultsFound = 0;

    // Search through all links in all groups
    linkGroups.forEach((group) => {
      group.links.forEach((link) => {
        if (
          link.title.toLowerCase().includes(searchTerm) ||
          link.description.toLowerCase().includes(searchTerm)
        ) {
          const linkCard = createLinkCard(link);
          resultsContainer.appendChild(linkCard);
          resultsFound++;
        }
      });
    });

    if (resultsFound === 0) {
      const noResults = document.createElement("div");
      noResults.className = "no-results";
      noResults.textContent = `No bookmarks found matching "${searchTerm}"`;
      resultsContainer.appendChild(noResults);
    } else {
      resultsTitle.textContent = `Search Results (${resultsFound})`;
    }

    resultsSection.appendChild(resultsTitle);
    resultsSection.appendChild(resultsContainer);
    mainContent.appendChild(resultsSection);
  });

  // Initial render
  renderAllLinkGroups();

  // Add everything to the root
  root.appendChild(header);
  root.appendChild(searchContainer);
  root.appendChild(mainContent);

  // Create the CSS
  const style = document.createElement("style");
  style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      
      body {
        background-color: #f7f7f7;
        color: #37352f;
        padding: 20px;
      }
      
      .header {
        margin: 40px auto 25px;
        max-width: 800px;
        padding: 0 20px;
      }
      
      .title {
        font-size: 40px;
        font-weight: 700;
        margin-bottom: 10px;
      }
      
      .subtitle {
        font-size: 18px;
        color: #6b7280;
      }
      
      .search-container {
        display: flex;
        align-items: center;
        max-width: 800px;
        margin: 0 auto 30px;
        padding: 0 20px;
        background-color: white;
        border-radius: 8px;
        box-shadow: rgba(15, 15, 15, 0.1) 0px 1px 3px;
      }
      
      .search-icon {
        display: flex;
        align-items: center;
        padding: 0 12px;
      }
      
      .search-input {
        flex: 1;
        padding: 14px 0;
        border: none;
        outline: none;
        font-size: 16px;
      }
      
      .main-content {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      .group-section {
        margin-bottom: 40px;
      }
      
      .group-title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 15px;
        color: #37352f;
        padding-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;
      }
      
      .link-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 16px;
      }
      
      .link-card {
        background-color: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: rgba(15, 15, 15, 0.1) 0px 1px 3px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      
      .link-card:hover {
        transform: translateY(-3px);
        box-shadow: rgba(15, 15, 15, 0.15) 0px 5px 10px;
      }
      
      .link-title {
        font-size: 18px;
        margin-bottom: 10px;
      }
      
      .link-title a {
        color: black;
        text-decoration: none;
      }
      
      .link-title a:hover {
        text-decoration: underline;
      }
      
      .link-description {
        color: #4b5563;
        margin-bottom: 15px;
        line-height: 1.5;
        flex-grow: 1;
      }
      
      .link-url {
        font-size: 14px;
        color: #9ca3af;
        padding-top: 8px;
        border-top: 1px solid #e5e7eb;
        word-break: break-all;
      }
      
      .no-results {
        grid-column: 1 / -1;
        padding: 30px;
        text-align: center;
        background-color: white;
        border-radius: 8px;
        color: #6b7280;
        font-size: 16px;
      }
      
      @media (max-width: 600px) {
        .link-container {
          grid-template-columns: 1fr;
        }
        
        .title {
          font-size: 32px;
        }
        
        .group-title {
          font-size: 20px;
        }
      }
    `;

  document.head.appendChild(style);
});
