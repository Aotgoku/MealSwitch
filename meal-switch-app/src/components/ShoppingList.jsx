import React, { useRef } from 'react';
import styled from 'styled-components';
import { X, ShoppingCart, Download } from 'lucide-react'; // Added Download

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 1.5rem;
  box-sizing: border-box;
`;

const ListContainer = styled.div`
  background: #1c1917;
  padding: 2.5rem;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  color: #f2f2f2;
  max-height: calc(100vh - 3rem);
  overflow-y: auto;
  box-sizing: border-box;

  @media (max-width: 640px) {
    width: 100%;
    height: 100%;
    max-height: 100vh;
    border-radius: 0;
    padding: 1.25rem;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #a8a29e;
  cursor: pointer;
  &:hover { color: white; }
`;

const CategorySection = styled.div`
  margin-bottom: 1.5rem;
`;

const CategoryTitle = styled.h3`
  color: #f97316;
  border-bottom: 1px solid #44403c;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ListItem = styled.li`
  padding: 0.5rem 0;
  border-bottom: 1px solid #292524;
  &:last-child {
    border-bottom: none;
  }
`;

// Added a generic button style for the new Download button to use
const ActionButton = styled.button`
    flex: 1;
    padding: 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    color: white;
    border: none;
    border-radius: 0.75rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s ease;

    &:disabled {
        background: #44403c;
        cursor: not-allowed;
    }
`;

const ShoppingList = ({ listData, onClose }) => {
  const contentRef = useRef(null);
  if (!listData) return null;

  const handleDownloadPDF = async () => {
    try {
      // Dynamically import the jsPDF library from a reliable CDN
      const { default: jsPDF } = await import('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.es.min.js');
      
      const doc = new jsPDF();
      let y = 15;
      
      doc.setFontSize(18);
      doc.text("Your Shopping List", 14, y);
      y += 10;

      listData.forEach(category => {
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(category.category, 14, y);
        y += 8;

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        category.items.forEach(item => {
          doc.text(`- ${item}`, 20, y);
          y += 7;
          if (y > 280) { // Add a new page if content overflows
            doc.addPage();
            y = 15;
          }
        });
        y += 5;
      });

      doc.save("MealSwitch-Shopping-List.pdf");
    } catch (error) {
        console.error("Failed to download PDF:", error);
        alert("Sorry, there was an error preparing the PDF.");
    }
  };

  return (
    <ModalOverlay>
      <ListContainer role="dialog" aria-modal="true" aria-label="Shopping list" ref={contentRef}>
        <CloseButton aria-label="Close shopping list" onClick={onClose}><X /></CloseButton>
        <h2 style={{ textAlign: 'center', marginTop: 0 }}>
          <ShoppingCart style={{ verticalAlign: 'bottom', marginRight: '0.5rem' }} />
          Your Shopping List
        </h2>

        {listData.map((category, index) => (
          <CategorySection key={index}>
            <CategoryTitle>{category.category}</CategoryTitle>
            <ItemList>
              {category.items.map((item, itemIndex) => (
                <ListItem key={itemIndex}>{item}</ListItem>
              ))}
            </ItemList>
          </CategorySection>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
          {/* Using a generic ActionButton styled-component */}
          <ActionButton onClick={onClose} style={{ background: '#44403c' }}>Close</ActionButton>
          <ActionButton onClick={handleDownloadPDF} style={{ background: '#22c55e' }}>
            <Download size={18}/>
            Download as PDF
          </ActionButton>
        </div>
      </ListContainer>
    </ModalOverlay>
  );
};

export default ShoppingList;