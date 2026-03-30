import { useState } from 'react'
import styles from './ImageCarousel.module.css'

export default function ImageCarousel({ images }) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  if (!images || images.length === 0) return null

  // Single image — no carousel needed
  if (images.length === 1) return (
    <>
      <img
        src={images[0]}
        alt=""
        className={styles.singleImage}
        onClick={e => { e.stopPropagation(); setLightbox(true) }}
      />
      {lightbox && (
        <Lightbox
          images={images}
          current={0}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  )

  function prev(e) {
    e.stopPropagation()
    setCurrent(c => (c - 1 + images.length) % images.length)
  }

  function next(e) {
    e.stopPropagation()
    setCurrent(c => (c + 1) % images.length)
  }

  return (
    <>
      <div className={styles.carousel} onClick={e => e.stopPropagation()}>
        <div className={styles.track} style={{ transform: `translateX(-${current * 100}%)` }}>
          {images.map((src, i) => (
            <div key={i} className={styles.slide}>
              <img
                src={src}
                alt=""
                className={styles.image}
                onClick={() => setLightbox(true)}
              />
            </div>
          ))}
        </div>

        <button className={`${styles.arrow} ${styles.left}`} onClick={prev}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <button className={`${styles.arrow} ${styles.right}`} onClick={next}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>

        <div className={styles.dots}>
          {images.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.activeDot : ''}`}
              onClick={e => { e.stopPropagation(); setCurrent(i) }}
            />
          ))}
        </div>

        <div className={styles.counter}>{current + 1} / {images.length}</div>
      </div>

      {lightbox && (
        <Lightbox
          images={images}
          current={current}
          onClose={() => setLightbox(false)}
        />
      )}
    </>
  )
}

function Lightbox({ images, current: initialCurrent, onClose }) {
  const [current, setCurrent] = useState(initialCurrent)

  function prev(e) {
    e.stopPropagation()
    setCurrent(c => (c - 1 + images.length) % images.length)
  }

  function next(e) {
    e.stopPropagation()
    setCurrent(c => (c + 1) % images.length)
  }

  return (
    <div className={styles.lightbox} onClick={onClose}>
      <button className={styles.closeBtn} onClick={onClose}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className={styles.lightboxContent} onClick={e => e.stopPropagation()}>
        <img src={images[current]} alt="" className={styles.lightboxImage} />

        {images.length > 1 && (
          <>
            <button className={`${styles.arrow} ${styles.left}`} onClick={prev}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button className={`${styles.arrow} ${styles.right}`} onClick={next}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
            <div className={styles.lightboxCounter}>{current + 1} / {images.length}</div>
          </>
        )}
      </div>
    </div>
  )
}