import linkGroups from "@example/data/examplesData";
import createStyles from "@example/styles";
import { createFavIcon } from "@example/utilities/gui/styles";

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");

  // Create header
  const header = document.createElement("header");
  header.className = "header";

  const title = document.createElement("h1");
  title.textContent = "ProtoGL Examples";
  title.className = "title";

  const subTitle = document.createElement("p");
  subTitle.textContent = "A collection of examples using ProtoGL";
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
  searchInput.placeholder = "Search examples...";
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

    linkElement.appendChild(linkTitle);
    linkElement.appendChild(linkDescription);

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
      noResults.textContent = `No examples found matching "${searchTerm}"`;
      resultsContainer.appendChild(noResults);
    } else {
      resultsTitle.textContent = `Search Results (${resultsFound})`;
    }

    resultsSection.appendChild(resultsTitle);
    resultsSection.appendChild(resultsContainer);
    mainContent.appendChild(resultsSection);
  });

  // Favicon
  createFavIcon();
  // Initial render
  renderAllLinkGroups();

  // Add everything to the root
  root.appendChild(header);
  root.appendChild(searchContainer);
  root.appendChild(mainContent);

  // Create the CSS
  createStyles();
});
