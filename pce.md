PCE PLANNING DOCUMENT
planning/lung_scrollytelling_website.md

PROJECT OVERVIEW
Build a hyper-premium, Awwwards-level, Apple-inspired scrollytelling medical education website dedicated entirely to human lung anatomy, physiology, and disease — combining cinematic 240-frame scroll-linked image sequence animation with deeply informative, beautifully designed interactive medical content sections. The experience balances wonder and education — every scroll reveals something new, every section teaches something profound, every interaction feels like a luxury product reveal applied to biological science.

EXECUTION LAYER PLANNING
Tech Stack
Framework: Next.js 14 App Router
Styling: Tailwind CSS
Animation: Framer Motion scroll-linked
Canvas: HTML5 Canvas image sequence playback
3D Elements: Three.js for particle effects
Data: JSON medical content files
Deployment: Modal / Vercel
Observability: LangFuse
Testing: pytest + Playwright
File Structure
workspace/
├── planning/
│   └── lung_scrollytelling_website.md
├── execution/
│   ├── image_sequence_loader.py
│   ├── medical_content_parser.py
│   ├── disease_data_fetcher.py
│   ├── animation_config_generator.py
│   └── performance_optimizer.py
├── tests/
│   ├── test_image_sequence.py
│   ├── test_medical_content.py
│   └── test_scroll_performance.py
├── history.md
├── observe.py
├── deploy.py
├── .pce.md
├── .env
└── requirements.txt

MASTER ENHANCED PROMPT
"Design and implement a hyper-premium, Awwwards-level, Apple-inspired cinematic scrollytelling medical education website entirely dedicated to the human lung — covering complete anatomy, physiology, disease conditions, clinical data, and interactive biological education. The website must feel like the intersection of an Apple product launch page, a Netflix documentary, and a Johns Hopkins medical textbook — simultaneously the most beautiful and most informative lung resource ever built on the web.

SEAMLESS FOUNDATION
The page uses pure dark-mode aesthetic with deep near-black background #050505 perfectly matching all image sequence frame backgrounds so lungs appear floating in seamless cinematic void with zero visible edges. Every section transitions feel like one continuous breathing organism — the website itself breathes.

NAVBAR — APPLE ULTRA MINIMAL
Fixed glassmorphism nav, backdrop-blur, rgba(5,5,5,0.75), slim compact Apple-height. Left: 'Lung Atlas' in geometric grotesk medium-weight. Center links: 'Anatomy', 'Physiology', 'Diseases', 'Conditions', 'Statistics', 'Explore'. Right: gradient CTA 'Begin Journey' from #FF6B35 to #00D6FF. Starts transparent at top, smooth fade-in after scroll. Hover: electric cyan #00D6FF underline micro-animation.

COLOR SYSTEM
Primary background:     #050505
Secondary background:   #0A0A0C
Card backgrounds:       #0F0F12
Heading text:           rgba(255,255,255,0.90)
Body text:              rgba(255,255,255,0.60)
Muted text:             rgba(255,255,255,0.35)
Primary accent warm:    #FF6B35  (lung tissue amber)
Primary accent cool:    #00D6FF  (oxygen cyan)
Crimson vascular:       #DC143C  (arterial blood)
Cobalt vascular:        #1E40AF  (venous blood)
Alveolar pearl:         #F0EDE8  (alveolar glow)
Disease alert:          #FF3B3B  (pathology red)
Healthy indicator:      #00FF88  (healthy green)
Warning indicator:      #FFB800  (caution amber)

TYPOGRAPHY SYSTEM
Display:    SF Pro Display / Inter — 96px bold tracking-tighter
H1:         72px bold tracking-tight
H2:         48px semibold tracking-tight
H3:         32px semibold
H4:         24px medium
Body:       18px regular line-height-relaxed
Caption:    14px regular muted
Label:      12px medium tracking-widest uppercase
Heading gradient: white → subtle #FF6B35 at letterform base. Kept barely perceptible. Body: solid rgba(255,255,255,0.6). All text feels editorial, clinical, and premium simultaneously.

SECTION 1 — CINEMATIC HERO
Scroll: 0–8% — Frames 1–24
Visual: Both lungs fully assembled, smooth matte biological tissue, warm pink-red surface, cool electric blue rim light from behind tracing every contour, warm amber fill from front-left, subsurface scattering, 8K photorealistic, floating in pure black void.
Copy:
Display:    THE HUMAN LUNG
H2:         Two organs. One breath. Infinite complexity.
Body:       Carrying 300 million alveoli, 1,500 miles of airways,
            and the complete mystery of respiration —
            inside every chest, every second of every life.
Label:      SCROLL TO BEGIN THE JOURNEY ↓
Interactive element: Breathing particle system — thousands of tiny cyan #00D6FF particles slowly drifting upward from below the lungs like oxygen molecules rising, particle count and speed responding to mouse position.

SECTION 2 — GLASS TRANSITION / ANATOMY INTRO
Scroll: 8–20% — Frames 25–60
Visual: Pleural surface transitioning from opaque tissue to crystal borosilicate glass, bronchial tree silhouette emerging, edge refractions catching blue rim light, warm amber internal glow building.
Copy left-aligned slide-in:
H2:    Engineered by evolution.
Body:  A pleural membrane thinner than glass houses
       the most complex branching architecture
       in the human body.
       
       Every surface. Every fold. Every fissure.
       All of it exists for one singular purpose.
       
       To breathe.
Interactive floating stat cards appearing with scroll:
Card 1:  WEIGHT          Card 2:  LOBES
         ~1.1 kg total            5 total
         both lungs               R:3  L:2

Card 3:  AGE             Card 4:  CAPACITY
         Fully mature             6 litres
         at age 25                total lung capacity
Cards styled: dark glass #0F0F12, subtle #FF6B35 top border glow, white/90 number, white/40 label, smooth fade-up entrance on scroll.

SECTION 3 — BRONCHIAL TREE
Scroll: 20–32% — Frames 61–96
Visual: Full transparent glass shell, complete bronchial tree revealed — trachea to terminal bronchioles, ivory-white cartilaginous rings, copper-gold smooth muscle walls, fractal branching at full resolution, crimson arterial and cobalt venous networks threading alongside every airway generation.
Copy right-aligned:
H2:    A fractal tree of infinite precision.
Body:  The bronchial tree branches exactly 23 times
       before reaching a single alveolus.
       
       Pulmonary arteries and veins mirror
       every airway with perfect biological symmetry.
       
       Over 1,500 miles of airways.
       Inside two fists of living tissue.
Interactive bronchial tree diagram — horizontal scrolling labeled diagram showing all 23 generations of airway branching with hover tooltips:
Generation 0:   Trachea              — diameter 18mm
Generation 1:   Primary bronchi      — diameter 12mm
Generation 2:   Lobar bronchi        — diameter 8mm
Generation 3:   Segmental bronchi    — diameter 6mm
Generation 4-9: Subsegmental bronchi — diameter tapering
Generation 10-16: Bronchioles        — diameter 1mm
Generation 17-19: Terminal bronchioles
Generation 20-22: Respiratory bronchioles
Generation 23:  Alveolar ducts → Alveoli
Each generation node glows #FF6B35 on hover, tooltip shows diameter, cell type lining, and function.

SECTION 4 — VASCULAR NETWORK
Scroll: 32–42% — Frames 97–120
Visual: Crimson pulmonary arterial tree and cobalt venous tree at full vivid saturation, capillary beds glowing at peripheral tissue, ruby capillary threads finest detail.
Copy left-aligned:
H2:    A river system inside every breath.
Body:  The pulmonary circulation moves your
       entire blood supply through the lungs
       every single minute.
       
       Crimson arteries carry depleted blood in.
       Cobalt veins carry oxygen-rich blood out.
       The exchange happens in 250 milliseconds.
Interactive circulatory flow diagram:
Animated flowing dots — red dots traveling inward along arterial paths, blue dots traveling outward along venous paths, dots transitioning from red to blue at alveolar capillary level. Real-time animation synchronized with scroll position. Hover any vessel segment for vessel name, diameter, blood pressure values, and flow rate data.
Live breathing stats panel:
Resting respiratory rate:    12-20 breaths/min
Tidal volume:                500 ml per breath
Minute ventilation:          6-8 litres/min
Pulmonary blood flow:        5 litres/min
Transit time through lung:   0.75 seconds

SECTION 5 — LOBAR ANATOMY
Scroll: 42–52% — Frames 121–148
Visual: Bronchopulmonary segments separating and floating apart in perfect radial anatomical alignment, each segment individually amber-orange rim-lit.
Copy right-aligned:
H2:    Precision-divided. Independently supplied.
Body:  Each bronchopulmonary segment functions
       as a self-contained breathing unit —
       its own airway, its own artery, its own vein.
       
       Ten segments right. Eight segments left.
       Each independently resectable by surgeons
       without affecting neighboring tissue.
Interactive 3D lobe selector:
Hoverable floating segment cards for each of the 18 bronchopulmonary segments. Click any segment to expand full anatomical detail panel:
RIGHT UPPER LOBE — 3 segments
├── Apical segment (S1)      — bronchus, artery, vein
├── Posterior segment (S2)   — bronchus, artery, vein
└── Anterior segment (S3)    — bronchus, artery, vein

RIGHT MIDDLE LOBE — 2 segments
├── Lateral segment (S4)
└── Medial segment (S5)

RIGHT LOWER LOBE — 5 segments
├── Superior segment (S6)
├── Medial basal (S7)
├── Anterior basal (S8)
├── Lateral basal (S9)
└── Posterior basal (S10)

LEFT UPPER LOBE — 4 segments
├── Apicoposterior (S1+2)
├── Anterior (S3)
├── Superior lingular (S4)
└── Inferior lingular (S5)

LEFT LOWER LOBE — 4 segments
├── Superior (S6)
├── Anteromedial basal (S7+8)
├── Lateral basal (S9)
└── Posterior basal (S10)

SECTION 6 — ALVEOLAR UNIVERSE
Scroll: 52–62% — Frames 149–168
Visual: Alveolar honeycomb emergence, pearl-white translucent sacs glowing in golden bioluminescent radiance, ruby capillary threads, blue oxygen particles.
Copy centered:
H2:    Where air becomes life.
Body:  300 million alveoli.
       A combined surface area the size of a tennis court —
       folded inside two organs the size of your fists.
       
       In 250 milliseconds, oxygen crosses
       the alveolar membrane and enters your bloodstream.
       Carbon dioxide exits.
       Life continues.
Interactive alveolar detail panel:
Alveolar diameter:           200-300 micrometers
Wall thickness:              0.1-0.2 micrometers
Surface tension control:     Surfactant (DPPC)
Gas exchange surface:        70-100 m²
Capillary transit time:      0.25-0.75 seconds
Type I pneumocytes:          95% surface coverage — gas exchange
Type II pneumocytes:         5% surface coverage — surfactant production
Alveolar macrophages:        Immune defense — 'dust cells'
Surfactant explainer card:
Glass card with #FF6B35 border glow explaining why premature babies need surfactant therapy — bridging anatomy to clinical medicine.

SECTION 7 — INTERIOR BRONCHIOLE JOURNEY
Scroll: 62–72% — Frames 169–204
Visual: First-person immersive bronchiole tunnel view, glistening membrane walls, capillaries glowing crimson, narrowing toward pearl alveolar clusters, warm amber volumetric haze.
Copy left-aligned:
H2:    A universe inside every breath.
Body:  Inside every bronchiole is a cathedral
       of biological engineering.
       
       Walls alive with capillaries.
       Cilia sweeping debris outward at 1,000 beats per minute.
       Goblet cells secreting protective mucus.
       Every surface optimized by 375 million years of evolution.
       
       At the end of every tunnel: light.
       The golden glow of oxygen exchange.
       The moment air becomes life.
Animated cilia diagram:
Side panel showing cross-section of bronchiole wall with animated cilia beating in coordinated metachronal wave pattern, mucus layer moving upward (mucociliary escalator), goblet cells secreting, labeled with hover tooltips explaining each cell type and function.
Mucociliary escalator stats:
Cilia beat frequency:     1,000 beats per minute
Mucus transport speed:    1-2 cm per minute
Daily mucus production:   100ml healthy / 500ml+ in disease
Cilia length:             6-7 micrometers

SECTION 8 — FULL EXPLODED DIAGRAM
Scroll: 72–80% — Frames 205–216
Visual: Complete lung fully exploded maximum separation, every biological layer floating in perfect radial alignment, glass pleural shell outermost, lobar segments next, bronchial tree central, vascular networks flanking, alveolar clusters glowing innermost core.
Copy right-aligned:
H2:    Every layer. Every system. Every breath.
Body:  Membrane. Lobes. Airways. Vessels. Alveoli.
       Five systems. One organ. Zero redundancy.
       
       Nature spent 375 million years
       perfecting this architecture.
       You carry it with you everywhere.
       Every second. Every breath.
Interactive layer toggle system:
Six toggle buttons — Pleura / Lobes / Airways / Arteries / Veins / Alveoli — each button glows #FF6B35 when active. Toggling isolates and highlights that specific layer in the exploded diagram while fading others. Each layer panel shows clinical relevance and associated disease conditions.

SECTION 9 — PHYSIOLOGY DEEP DIVE
Scroll: 80–85% — Static section, full-width
Visual: Canvas pauses, full-width editorial section with dark glass cards.
Content blocks:
Gas Exchange Physics:
Dalton's Law of Partial Pressures
Henry's Law of Gas Solubility
Fick's Law of Diffusion

Alveolar PO₂:    104 mmHg
Arterial PO₂:    95 mmHg
Venous PO₂:      40 mmHg

Alveolar PCO₂:   40 mmHg
Arterial PCO₂:   40 mmHg
Venous PCO₂:     46 mmHg
Oxygen Transport:
Hemoglobin carries:    98.5% of oxygen
Dissolved in plasma:   1.5% of oxygen
Oxyhemoglobin curve:   S-shaped sigmoid
Bohr effect:           CO₂ and pH shift curve right
2,3-DPG effect:        Altitude adaptation
Respiratory Control:
Primary controller:    Medullary respiratory center
Central chemoreceptors: Respond to CO₂/pH
Peripheral chemoreceptors: Carotid/aortic bodies — O₂
Hering-Breuer reflex:  Stretch receptors prevent over-inflation
Apneustic center:      Pons — sustained inspiration
Pneumotaxic center:    Pons — limits inspiration
Each block styled as glass card #0F0F12 with subtle electric cyan top border, expandable on click to show full clinical detail.

SECTION 10 — DISEASE CONDITIONS ATLAS
Scroll: 85–92% — Interactive disease carousel
Visual: Canvas shows affected lung appearance for each selected disease — color shifts from healthy warm amber to disease-specific visual states.
Master disease library with full clinical cards:
OBSTRUCTIVE DISEASES
COPD — Chronic Obstructive Pulmonary Disease:
Prevalence:      480 million worldwide (2023)
Mortality:       3.23 million deaths/year — 3rd leading cause
Mechanism:       Airflow obstruction — emphysema + chronic bronchitis
FEV1/FVC ratio:  <0.70 (diagnostic criterion)
Gold staging:    I (mild) → IV (very severe)
Risk factors:    Smoking 85%, air pollution, occupational dust
Symptoms:        Dyspnea, chronic cough, sputum production
Treatment:       Bronchodilators, ICS, pulmonary rehabilitation, O₂
Visual state:    Hyperinflated barrel chest, destroyed alveolar walls,
                 enlarged air spaces, flattened diaphragm
Asthma:
Prevalence:      262 million worldwide
Mortality:       455,000 deaths/year
Mechanism:       Reversible airway inflammation and bronchoconstrasm
Triggers:        Allergens, exercise, cold air, infections, stress
Pathology:       Eosinophilic inflammation, mucus plugging,
                 smooth muscle hypertrophy, basement membrane thickening
Diagnosis:       Spirometry — reversible obstruction >12% post-bronchodilator
Treatment:       SABA rescue, ICS controller, LABA, biologics (severe)
Visual state:    Narrowed bronchi, thick mucus plugs, inflamed walls,
                 dilated mucous glands
Bronchiectasis:
Prevalence:      ~200 per 100,000 adults
Mechanism:       Permanent bronchial dilation from recurrent infection
Causes:          Post-infectious, CF, immunodeficiency, primary ciliary dyskinesia
Symptoms:        Daily productive cough, recurrent infections, hemoptysis
Diagnosis:       HRCT — signet ring sign, tram-track opacities
Treatment:       Airway clearance, antibiotics, surgery
Visual state:    Dilated tortuous bronchi wider than adjacent artery,
                 thickened bronchial walls, mucus pooling
RESTRICTIVE DISEASES
Pulmonary Fibrosis (IPF):
Prevalence:      3 million worldwide
Prognosis:       Median survival 3-5 years from diagnosis
Mechanism:       Progressive fibrotic scarring replacing normal lung tissue
Pathology:       UIP pattern — honeycombing, traction bronchiectasis,
                 fibroblastic foci, temporal heterogeneity
Diagnosis:       HRCT — basal predominant honeycombing
                 PFTs — reduced TLC, reduced DLCO
Treatment:       Nintedanib, Pirfenidone — slow progression only
Visual state:    Shrunken scarred stiff lungs, honeycombing at bases,
                 traction bronchiectasis, loss of normal architecture
Sarcoidosis:
Prevalence:      10-40 per 100,000
Mechanism:       Non-caseating granuloma formation — unknown trigger
Radiology:       Bilateral hilar lymphadenopathy — 'potato nodes'
                 Perilymphatic nodules, upper lobe predominance
Stages:          0 (normal) → IV (fibrosis)
Treatment:       Corticosteroids, methotrexate, hydroxychloroquine
Visual state:    Bilateral hilar enlargement, perilymphatic nodule
                 distribution, upper lobe scarring in advanced disease
INFECTIOUS DISEASES
Pneumonia:
Burden:          2.5 million deaths/year globally
Classification:  CAP / HAP / HCAP / VAP
Pathogens:       S.pneumoniae (most common CAP), Klebsiella,
                 H.influenzae, Legionella, Mycoplasma, viruses
Pathology:       Lobar consolidation → bronchopneumonia → interstitial
Diagnosis:       CXR consolidation, CT, sputum, blood cultures
CURB-65 score:   Confusion, Urea, RR, BP, Age>65 — severity scoring
Treatment:       Amoxicillin/co-amoxiclav, macrolides, fluoroquinolones
Visual state:    Dense lobar consolidation, air bronchograms,
                 pleural effusion in severe cases
Tuberculosis:
Burden:          10 million new cases/year, 1.3 million deaths
Mechanism:       Mycobacterium tuberculosis — airborne droplet transmission
Primary TB:      Ghon focus + hilar lymphadenopathy = Ghon complex
Post-primary:    Upper lobe cavitation, caseous necrosis, fibrosis
Miliary TB:      Hematogenous spread — 1-2mm nodules throughout lung
Diagnosis:       Mantoux, IGRA, sputum AFB, culture, GeneXpert PCR
Treatment:       RIPE — Rifampicin, Isoniazid, Pyrazinamide, Ethambutol
                 6 months minimum. MDR-TB requires 18-24 months
Visual state:    Upper lobe cavitation, fibrocalcific changes,
                 miliary pattern, pleural effusion
VASCULAR DISEASES
Pulmonary Embolism:
Incidence:       600,000-900,000 cases/year USA
Mortality:       Up to 30% untreated, 2-8% treated
Source:          DVT — deep vein thrombosis — 80% of cases
Risk factors:    Virchow's triad — stasis, hypercoagulability, endothelial injury
Massive PE:      Saddle embolus at main pulmonary artery bifurcation
CTPA:            Gold standard — filling defect in pulmonary artery
Wells score:     Pre-test probability calculation
Treatment:       Anticoagulation, thrombolysis (massive), thrombectomy
Visual state:    Pulmonary infarct — wedge-shaped pleural-based opacity,
                 Hampton's hump, Westermark sign on CXR
Pulmonary Hypertension:
Definition:      Mean PAP >20mmHg at rest
WHO Groups:      I (PAH) II (Left heart) III (Lung disease)
                 IV (Chronic thromboembolic) V (Multifactorial)
Pathology:       Plexiform lesions, medial hypertrophy, intimal fibrosis
Right heart:     Progressive RV failure — cor pulmonale
Treatment:       Prostacyclins, PDE5 inhibitors, ERA, sGC stimulators
Visual state:    Enlarged main pulmonary artery, pruned peripheral
                 vessels, right heart enlargement
MALIGNANT DISEASE
Lung Cancer:
Burden:          2.2 million new cases/year — most common cancer death
Histology:       NSCLC 85%  (Adenocarcinoma 40%, SCC 25%, Large cell 10%)
                 SCLC 15%   (Central, rapid growth, paraneoplastic)
Risk:            Smoking — 85% of cases. Radon, asbestos, air pollution
Staging:         TNM staging I-IV. Mediastinal involvement critical
Molecular:       EGFR, ALK, ROS1, KRAS, PD-L1 — targeted therapy
Treatment:       Surgery (I-II), CRT (III), systemic therapy (IV)
                 Immunotherapy — pembrolizumab, nivolumab
Screening:       Low-dose CT — high risk smokers 50-80 years
Visual state:    Spiculated peripheral mass (adenocarcinoma),
                 central hilar mass (SCC/SCLC), mediastinal widening,
                 pleural effusion, lymphangitis carcinomatosa
Mesothelioma:
Cause:           Asbestos exposure — 20-40 year latency period
Types:           Pleural (most common), peritoneal, pericardial
Prognosis:       Median survival 12-18 months
Diagnosis:       CT, PET, VATS biopsy — epithelioid vs sarcomatoid
Treatment:       Chemotherapy — pemetrexed + platinum. Immunotherapy
Visual state:    Circumferential pleural thickening, pleural effusion,
                 encasing the lung, mediastinal shift
PLEURAL DISEASE
Pleural Effusion:
Definition:      Excess fluid in pleural space (normal 15ml)
Light's criteria: Exudate vs Transudate — protein/LDH ratios
Causes exudate:  Pneumonia, malignancy, PE, TB, autoimmune
Causes transudate: CCF, cirrhosis, nephrotic syndrome, hypoalbuminemia
Diagnosis:       CXR >200ml visible, USS guided aspiration, CT
Treatment:       Treat cause, thoracentesis, chest drain, pleurodesis
Visual state:    Blunting of costophrenic angle, meniscus sign,
                 mediastinal shift away from large effusion
Pneumothorax:
Primary:         Spontaneous — tall thin young males, blebs
Secondary:       Underlying lung disease — COPD, CF, asthma
Tension:         Medical emergency — tracheal deviation, haemodynamic collapse
Diagnosis:       CXR — visible pleural line, absent lung markings
Treatment:       Observation (small primary), aspiration, chest drain
                 Tension — immediate needle decompression 2nd ICS MCL
Visual state:    Visible pleural line, absent lung markings peripherally,
                 collapsed lung toward hilum, mediastinal shift (tension)

SECTION 11 — GLOBAL LUNG DISEASE STATISTICS
Static full-width section with animated data visualizations
Animated counter cards — numbers count up on scroll entry:
480 million    People with COPD worldwide
262 million    People with Asthma worldwide
10 million     New TB cases per year
2.2 million    New lung cancer cases per year
2.5 million    Pneumonia deaths per year
4.2 million    Deaths from ambient air pollution/year
3.8 million    Deaths from household air pollution/year
1 billion      Smokers worldwide
Interactive world map:
Choropleth map showing lung disease burden by country — toggle between COPD / Asthma / TB / Lung Cancer / Air Pollution Index. Country hover shows national statistics. Color scale: #00FF88 (low burden) → #FFB800 (medium) → #FF3B3B (high burden).
Risk factor breakdown donut chart:
Smoking:              70% of COPD and lung cancer
Air pollution:        29% of lung disease burden
Occupational:         15% — asbestos, silica, coal dust
Infections:           TB, pneumonia, post-viral fibrosis
Genetic:              Alpha-1 antitrypsin deficiency, CF

SECTION 12 — SMOKING AND THE LUNG
Scroll-triggered comparison section
Side-by-side scroll comparison:
Left: Healthy lung — warm amber pink, translucent glass, golden alveolar glow
Right: Smoker's lung — dark grey-black, destroyed alveolar architecture, emphysematous spaces, pigmented macrophages, tumour masses
Progressive damage timeline — horizontal scroll:
Year 1:    Cilia damage begins, mucus accumulation, morning cough
Year 5:    Goblet cell hyperplasia, chronic bronchitis established
Year 10:   FEV1 declining faster than normal — subclinical COPD
Year 15:   Emphysematous changes visible on HRCT
Year 20:   Moderate COPD, exercise limitation, recurrent infections
Year 25:   Severe COPD or lung cancer risk 25x baseline
Year 30:   Very severe COPD, oxygen dependency, cor pulmonale
Cessation benefits counter:
Interactive slider — years since quitting — showing progressive risk reduction and physiological recovery timeline. Lung appearance animation shows gradual recovery of color and architecture with years of cessation.

SECTION 13 — LUNG FUNCTION TESTING INTERACTIVE
Static educational section
Interactive spirometry simulator:
Animated flow-volume loop — normal vs obstructive vs restrictive patterns. User can toggle between patterns to see curve changes. Hover any part of curve for clinical interpretation.
Key measurements explained with interactive cards:
FVC:     Forced Vital Capacity           — total air forcibly exhaled
FEV1:    Forced Expiratory Volume 1sec   — obstructive marker
FEV1/FVC: Tiffeneau index               — <0.70 = obstruction
TLC:     Total Lung Capacity             — reduced in restriction
RV:      Residual Volume                 — increased in emphysema
DLCO:    Diffusing capacity CO           — gas exchange efficiency
6MWT:    Six Minute Walk Test            — functional exercise capacity
GOLD staging calculator:
Input FEV1% predicted → system displays GOLD grade, clinical interpretation, and recommended treatment pathway.

SECTION 14 — TREATMENT AND INTERVENTIONS
Full-width editorial section with glass cards
Inhaler device interactive guide:
3D rotating inhaler models with animated drug deposition patterns showing where different particle sizes deposit in the airway:
SABA:    Salbutamol — bronchodilation 15min onset
LABA:    Salmeterol — long-acting 12hr bronchodilation
SAMA:    Ipratropium — anticholinergic bronchodilation
LAMA:    Tiotropium — once daily anticholinergic
ICS:     Fluticasone — anti-inflammatory steroid
Surgical procedures section:
Lobectomy:          Remove entire lobe — lung cancer Stage I-II
Pneumonectomy:      Remove entire lung — central tumours
VATS:               Video-assisted thoracoscopic surgery — minimally invasive
Lung transplant:    IPF, CF, COPD end-stage — single or bilateral
LVRS:               Lung volume reduction surgery — severe emphysema
Pleurodesis:        Chemical or mechanical — recurrent pneumothorax/effusion
Bronchoscopy:       Diagnostic and therapeutic — BAL, biopsy, stenting
EBUS:               Endobronchial ultrasound — mediastinal staging

SECTION 15 — REASSEMBLY AND FINAL CTA
Scroll: 92–100% — Frames 217–240
Visual: All components gracefully converging back to perfect anatomical position, warm amber bioluminescent interior glow through complete transparent glass shell, cool blue rim light tracing outer glass edge, final cinematic hero beauty shot.
Copy centered bold:
Display:  BREATHE DIFFERENTLY.
          SEE EVERYTHING.
H2:       The Human Lung.
          Nature's masterpiece of biological engineering.
Body:     Every breath you take involves 300 million alveoli,
          1,500 miles of airways, and 375 million years of evolution.
          Now you know why.
CTA:      Begin The Journey  [gradient button #FF6B35 → #00D6FF]
Link:     Explore Full Disease Atlas →
Micro:    Built with reverence for the most extraordinary
          biological architecture in the known universe.

EXECUTION SCRIPTS
execution/image_sequence_loader.py
python# Handles 240-frame image sequence preloading
# Canvas frame mapping from scroll percentage
# Performance optimization with requestAnimationFrame
# Smooth frame interpolation preventing flicker
execution/medical_content_parser.py
python# Parses disease condition JSON data files
# Generates interactive card content
# Handles clinical data formatting
# Citation and source attribution
execution/disease_data_fetcher.py
python# Fetches latest WHO/CDC disease statistics
# Updates prevalence and mortality figures
# Caches data with 24hr refresh cycle
# Fallback to static data on API failure
execution/animation_config_generator.py
python# Generates Framer Motion animation configs
# Scroll percentage to frame index mapping
# Text overlay timing synchronization
# Performance profiling and optimization
execution/performance_optimizer.py
python# Image lazy loading and preloading strategy
# Canvas hardware acceleration configuration
# Memory management for 240 image sequence
# FPS monitoring and adaptive quality
```

---

## TESTING PLAN
```
tests/test_image_sequence.py    — Frame loading, canvas rendering, scroll sync
tests/test_medical_content.py   — Data accuracy, card rendering, interactions
tests/test_scroll_performance.py — FPS, memory, smooth animation validation
tests/test_disease_atlas.py     — Disease card data, clinical accuracy
tests/test_accessibility.py     — WCAG 2.1 AA compliance, screen readers
```

---

## DEPLOYMENT
```
Platform:    Vercel (Next.js native)
CDN:         Cloudflare — 240 image frames served from edge
Monitoring:  LangFuse — user interaction tracking
Analytics:   Vercel Analytics — scroll depth, section engagement
Performance: Core Web Vitals monitoring — LCP, CLS, FID targets
```

---

## HISTORY LOG TEMPLATE
```
history.md

2026-03-11 | Canvas | 240 frames memory spike | Implemented lazy 
            loading with 30-frame lookahead window | Never preload 
            all 240 frames simultaneously

2026-03-11 | Scroll | Frame flicker on fast scroll | Implemented 
            frame interpolation and requestAnimationFrame throttling | 
            Map scroll to nearest even frame for smoothness

2026-03-11 | Disease data | WHO API rate limit | Implemented 24hr 
            cache with static fallback | Always cache external 
            medical data locally