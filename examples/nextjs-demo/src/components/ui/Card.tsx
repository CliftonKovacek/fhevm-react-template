/**
 * Card Component
 *
 * Reusable card container with optional header and footer
 */

import { ReactNode } from 'react';
import styles from '../../styles/Components.module.css';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  className?: string;
}

export default function Card({
  children,
  title,
  subtitle,
  footer,
  className,
}: CardProps) {
  return (
    <div className={`${styles.card} ${className || ''}`}>
      {(title || subtitle) && (
        <div className={styles.cardHeader}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
        </div>
      )}
      <div className={styles.cardBody}>{children}</div>
      {footer && <div className={styles.cardFooter}>{footer}</div>}
    </div>
  );
}
