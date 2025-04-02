import React from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">Vignan University Alumni Network</div>
        <div className="footer-credits">
          Developed And Maintained By Krishna Kant Kumar And Team
        </div>
        <div className="footer-copyright">
          © {currentYear} Vignan University. All Rights Reserved.
        </div>
      </div>
      <div className="footer-decoration"></div>
      
      {/* Peacock feather decorative elements */}
      <div className="peacock-feather" style={{ right: '10%', bottom: '60px', transform: 'rotate(-10deg) scale(0.7)', opacity: 0.1 }}></div>
      <div className="peacock-feather" style={{ left: '12%', bottom: '70px', transform: 'rotate(15deg) scale(0.6)', opacity: 0.1 }}></div>
    </footer>
  );
}