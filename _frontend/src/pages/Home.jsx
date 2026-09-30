import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ImagePlaceholder from '../components/ImagePlaceholder'
import styles from './Home.module.css'

// Animation Variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const slowScale = {
  hidden: { scale: 1.05, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 1.4, ease: 'easeOut' } }
}

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className={styles.main}>

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroImgWrap}>
          <img src="/images/home-hero.jpg" alt="Home Hero" />
        </div>
        <div className={styles.heroOverlay} />
        
        <motion.div 
          className={styles.heroContent}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={fadeUp} className={`overline ${styles.eyebrow}`}>A Private Studio</motion.p>
          <motion.h1 variants={fadeUp} className={styles.heroTitle}>
            The Art of<br /><em>Being Seen</em>
          </motion.h1>
          <motion.p variants={fadeUp} className={styles.heroSub}>
            Curated sessions with photographers who understand light as language.
          </motion.p>
          <motion.div variants={fadeUp} className={styles.heroCta}>
            <button className="btn-primary" onClick={() => navigate('/photographers')}>
              Browse Photographers
            </button>
            <button className="btn-ghost-light" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <span>Scroll</span>
          <div className={styles.scrollLine} />
        </motion.div>
      </section>

      {/* ── CINEMATIC QUOTE ── */}
      <section className={styles.quoteBlock}>
        <motion.div 
          className={styles.quoteInner}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <span className={styles.quoteMark}>"</span>
          <h2 className={styles.quoteText}>
            To photograph is to hold one's breath, when all faculties converge to capture fleeting reality. It's at that precise moment that mastering an image becomes a great physical and intellectual joy.
          </h2>
          <p className={styles.quoteAuthor}>— Henri Cartier-Bresson</p>
        </motion.div>
      </section>

      {/* ── EDITORIAL STRIP ── */}
      <div className={styles.strip}>
        {[
          ['01', 'Curated Talent'],
          ['02', 'Verified Availability'],
          ['03', 'Conflict-Free Booking'],
          ['04', 'Private Sessions'],
        ].map(([num, text], i, arr) => (
          <div key={num} className={styles.stripGroup}>
            <div className={styles.stripItem}>
              <span className={styles.stripNum}>{num}</span>
              <span className={styles.stripText}>{text}</span>
            </div>
            {i < arr.length - 1 && <div className={styles.stripDivider} />}
          </div>
        ))}
      </div>

      {/* ── FEATURED GRID ── */}
      <section className={styles.sectionFeatured}>
        <motion.div 
          className={styles.sectionHeader}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <div className={styles.sectionRule} />
          <div>
            <p className="overline">Selected Work</p>
            <h2 className={styles.sectionTitle}>From Our<br />Studio Floor</h2>
          </div>
        </motion.div>
        
        <motion.div 
          className={styles.featuredGrid}
          variants={staggerContainer}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUp} className={`${styles.featuredCard} ${styles.tall}`}>
            <img src="/images/featured-vertical.jpg" alt="Featured Vertical" />
            <div className={styles.cardCaption}>
              <span className={styles.captionOver}>Portrait</span>
              <span className={styles.captionTitle}>Light &amp; Shadow</span>
            </div>
          </motion.div>
          <div className={styles.featuredCol}>
            <motion.div variants={fadeUp} className={`${styles.featuredCard} ${styles.wide}`}>
              <img src="/images/featured-horizontal-1.jpg" alt="Featured Horizontal 1" />
              <div className={styles.cardCaption}>
                <span className={styles.captionOver}>Fashion</span>
                <span className={styles.captionTitle}>The Quiet Frame</span>
              </div>
            </motion.div>
            <motion.div variants={fadeUp} className={`${styles.featuredCard} ${styles.wide}`}>
              <img src="/images/featured-horizontal-2.jpg" alt="Featured Horizontal 2" />
              <div className={styles.cardCaption}>
                <span className={styles.captionOver}>Still Life</span>
                <span className={styles.captionTitle}>Negative Space</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── THE ARCHIVE COLLAGE ── */}
      <section className={styles.sectionCollage}>
        <motion.div 
          className={styles.collageHeader}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <p className="overline" style={{ color: 'var(--sage)' }}>Exhibition</p>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: 20 }}>
            Visual <em>Poetry</em>
          </h2>
          <p className={styles.collageSub}>
            A mosaic of moments caught between intention and accident. Replace these with your own editorial campaign shots.
          </p>
        </motion.div>
        
        <motion.div 
          className={styles.collageGrid}
          variants={staggerContainer}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div variants={fadeUp} className={`${styles.collageItem} ${styles.c1}`}>
            <img src="/images/collage-large.jpg" alt="Collage Large" />
          </motion.div>
          <motion.div variants={fadeUp} className={`${styles.collageItem} ${styles.c2}`}>
            <img src="/images/collage-small-top.jpg" alt="Collage Small Top" />
          </motion.div>
          <motion.div variants={fadeUp} className={styles.collageQuote}>
            <p>"Light glorifies everything. It transforms and ennobles the most commonplace and ordinary subjects."</p>
          </motion.div>
          <motion.div variants={fadeUp} className={`${styles.collageItem} ${styles.c3}`}>
            <img src="/images/collage-tall.jpg" alt="Collage Tall" />
          </motion.div>
          <motion.div variants={fadeUp} className={`${styles.collageItem} ${styles.c4}`}>
            <img src="/images/collage-small-bottom.jpg" alt="Collage Small Bottom" />
          </motion.div>
          <motion.div variants={fadeUp} className={`${styles.collageItem} ${styles.c5}`}>
            <img src="/images/collage-wide.jpg" alt="Collage Wide" />
          </motion.div>
        </motion.div>
      </section>

      {/* ── PROCESS ── */}
      <section className={styles.sectionProcess}>
        <motion.div 
          className={styles.processInner}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className={styles.processHeader}>
            <p className="overline" style={{ color: '#6b6f4e' }}>How It Works</p>
            <h2 className={styles.sectionTitle} style={{ color: '#e6e0d6' }}>
              Three Steps<br />to a Session
            </h2>
          </motion.div>
          <div className={styles.processSteps}>
            {[
              ['I',   'Browse & Choose',   'Explore our curated roster of photographers, each with distinct specialties and verified availability calendars.'],
              ['II',  'Select a Date',     'Choose from genuinely available dates. Our system prevents double-booking at the schema level — no surprises.'],
              ['III', 'Confirm & Shoot',   'Your booking is instantly confirmed. Manage all sessions from your private dashboard.'],
            ].map(([roman, title, desc]) => (
              <motion.div variants={fadeUp} key={roman} className={styles.processStep}>
                <div className={styles.stepNum}>{roman}</div>
                <div>
                  <h3 className={styles.stepTitle}>{title}</h3>
                  <p className={styles.stepDesc}>{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── MANIFESTO ── */}
      <section className={styles.sectionManifesto}>
        <motion.div 
          className={styles.manifestoImgCol}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={slowScale}
        >
          <img src="/images/manifesto.jpg" alt="Manifesto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </motion.div>
        <motion.div 
          className={styles.manifestoText}
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <p className="overline">Our Belief</p>
          <h2 className={styles.manifestoHeading}>
            Photography is not<br />a service. It is<br /><em>an encounter.</em>
          </h2>
          <p className={styles.manifestoBody}>
            Every session we facilitate is a meeting between two ways of seeing — the subject's self-knowledge and the photographer's vision. We built OBSCURA to make that encounter possible, with no friction, no double-bookings, and no compromise.
          </p>
          <button className="btn-primary" onClick={() => navigate('/photographers')} style={{ marginTop: 12 }}>
            Find Your Photographer
          </button>
        </motion.div>
      </section>

    </main>
  )
}
