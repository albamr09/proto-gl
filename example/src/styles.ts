const createStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      
      body {
        background-color:rgb(252, 252, 252);
        color: #37352f;
        padding-top: 0;
        margin: 0;
      }
      
      .sticky-header {
        position: sticky;
        top: 0;
        background-color: rgba(255, 255, 255, 0.8);
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        width: 100%;
        padding: 15px 0;
        z-index: 1000;
        backdrop-filter: blur(5px);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 80vw;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }
      
      .title-section {
        flex: 1;
      }
      
      .title {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 5px;
      }
      
      .subtitle {
        font-size: 14px;
        color: rgb(155, 155, 155);
      }
      
      .github-link {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #37352f;
        text-decoration: none;
        transition: transform 0.2s ease;
        margin-left: 20px;
      }
      
      .github-link:hover {
        transform: scale(1.05);
      }
      
      .github-link svg {
        fill: #37352f;
      }
      
      .search-container {
        display: flex;
        align-items: center;
        flex: 1;
        margin: 10px auto 0;
        background-color: white;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
      }
      
      .search-icon {
        display: flex;
        align-items: center;
        padding: 0 12px;
      }
      
      .search-input {
        flex: 1;
        padding: 12px 0;
        border: none;
        outline: none;
        font-size: 16px;
      }
      
      .content-wrapper {
        padding-top: 30px;
      }
      
      .main-content {
        max-width: 1200px;
        width: 80vw;
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
        font-size: 22px;
        margin-bottom: 10px;
      }
      
      .link-title a {
        color: rgb(54, 54, 54);
        text-decoration: none;
      }
      
      .link-title a:hover {
        text-decoration: underline;
      }

      .link-info {
        display: flex;
        height: 100%;
        color: #9ca3af;
        gap: 15px;
      }

      .link-source {
        display: flex;
        align-items: end;
        text-decoration: none;
        width: 25px;
      }
      
      .link-description {
        line-height: 1.5;
        flex-grow: 1;
        font-size: 14px;
        padding-top: 5px;
        flex: 1;
      }
      
      .no-results {
        grid-column: 1 / -1;
        padding: 30px;
        text-align: center;
        background-color: white;
        border-radius: 8px;
        font-size: 16px;
        color: #9ca3af;
      }
      
      @media (max-width: 768px) {
        .sticky-header {
          padding: 10px 0;
        }
        
        .header-content {
          width: 90vw;
          flex-direction: row;
          align-items: center;
        }
        
        .search-container,
        .main-content {
          width: 90vw;
        }
        
        .title {
          font-size: 24px;
        }
        
        .subtitle {
          font-size: 12px;
        }
      }
      
      @media (max-width: 600px) {
        .link-container {
          grid-template-columns: 1fr;
        }
        
        .group-title {
          font-size: 20px;
        }
        
        .header-content {
          flex-direction: column;
          align-items: flex-start;
        }
        
        .github-link {
          margin-left: 0;
          margin-top: 10px;
          align-self: flex-end;
        }
      }
    `;

  document.head.appendChild(style);
};

export default createStyles;
