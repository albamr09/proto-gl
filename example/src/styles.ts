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
        background-color: #f7f7f7;
        color: #37352f;
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
        font-size: 16px;
        color:rgb(155, 155, 155);
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
        max-width: 80vw;
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
        color:rgb(54, 54, 54);
        text-decoration: none;
      }
      
      .link-title a:hover {
        text-decoration: underline;
      }
      
      .link-description {
        color: #9ca3af;
        line-height: 1.5;
        flex-grow: 1;
        font-size: 14px;
        padding-top: 5px;
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
};

export default createStyles;
