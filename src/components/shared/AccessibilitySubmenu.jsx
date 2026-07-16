import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accessibility, ChevronLeft } from "lucide-react";
import { useAccessibility } from "../../context/AccessibilityContext";

const AccessibilitySubmenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { highContrast, largeText, reduceMotion, toggle } = useAccessibility();

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        className="d-dropdown-item"
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: "100%" }}
      >
        <Accessibility size={16} />
        <span>Accessibility</span>
        <ChevronLeft
          size={14}
          className="d-dropdown-arrow"
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="d-a11y-submenu"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="d-a11y-item">
              <span>High Contrast Mode</span>
              <div
                className={`d-toggle-switch ${highContrast ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle("highContrast");
                }}
                role="switch"
                aria-checked={highContrast}
                tabIndex={0}
              />
            </div>
            <div className="d-a11y-item">
              <span>Large Text</span>
              <div
                className={`d-toggle-switch ${largeText ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle("largeText");
                }}
                role="switch"
                aria-checked={largeText}
                tabIndex={0}
              />
            </div>
            <div className="d-a11y-item">
              <span>Reduce Motion</span>
              <div
                className={`d-toggle-switch ${reduceMotion ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle("reduceMotion");
                }}
                role="switch"
                aria-checked={reduceMotion}
                tabIndex={0}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccessibilitySubmenu;
