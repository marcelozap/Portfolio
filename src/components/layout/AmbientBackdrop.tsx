import styles from './DragonShell.module.css';

export function AmbientBackdrop() {
  return (
    <div aria-hidden="true" className={styles.backdrop} data-theme="red">
      <svg className={styles.stars} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="xiv-night-sky" width="1300" height="1100" patternUnits="userSpaceOnUse">
            {Array.from({ length: 85 }, (_, index) => (
              <circle
                key={index}
                cx={(index * 317 + 83) % 1300}
                cy={(index * 191 + index * index * 13 + 37) % 1100}
                r={index % 9 === 0 ? 1.15 : index % 3 === 0 ? 0.8 : 0.5}
                fill={index % 7 === 0 ? '#e3bd75' : '#e6eaf2'}
                opacity={index % 9 === 0 ? 0.52 : index % 3 === 0 ? 0.32 : 0.2}
              />
            ))}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#xiv-night-sky)" />
      </svg>
    </div>
  );
}
