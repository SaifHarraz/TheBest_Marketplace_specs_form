const fs = require('fs');
const path = require('path');
const { FEATURES_DATA, CATEGORIES_DATA } = require('./features_data.js');
const { JOURNEY_NODES } = require('./journey_data.js');

console.log(`Loaded ${FEATURES_DATA.length} features, ${CATEGORIES_DATA.length} categories, and ${JOURNEY_NODES.length} journey nodes.`);

// Build index.html
const htmlContent = `<!DOCTYPE html>
<html lang="ar" dir="rtl" class="h-full bg-slate-50">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>أداة تصميم تجربة المتجر وتحديد نطاق المرحلة الأولى | Interactive E-commerce Journey & Feature Builder</title>
  
  <!-- Google Fonts: Cairo -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Cairo', 'sans-serif'],
          },
          colors: {
            brand: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
              950: '#0f172a',
            }
          }
        }
      }
    }
  </script>

  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>

  <style>
    body {
      font-family: 'Cairo', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Smooth Transitions */
    * {
      transition-property: background-color, border-color, color, fill, stroke;
      transition-duration: 150ms;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Custom Scrollbars */
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Print Styles */
    @media print {
      header, footer, nav, .no-print, button, input[type="file"], .sticky {
        display: none !important;
      }
      body {
        background: white !important;
        color: black !important;
        font-size: 11pt;
      }
      .print-page-break {
        page-break-before: always;
      }
      .print-shadow-none {
        box-shadow: none !important;
        border: 1px solid #e2e8f0 !important;
      }
      #stage1-container, #stage2-container, #stage3-container, #stage4-container {
        display: block !important;
      }
      .flowchart-canvas {
        transform: scale(0.85) !important;
        transform-origin: top center !important;
        overflow: visible !important;
      }
    }

    /* Flowchart Canvas Styles */
    .flowchart-wrapper {
      user-select: none;
      touch-action: pan-x pan-y;
    }
    
    .node-card {
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;
    }
    .node-card:hover {
      transform: translateY(-2px);
    }
  </style>
</head>
<body class="min-h-full flex flex-col text-slate-800 bg-slate-50 selection:bg-brand-100 selection:text-brand-900">

  <!-- TOP APP HEADER / BAR -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm no-print">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        
        <!-- Brand / Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
            <i data-lucide="store" class="w-5 h-5"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base font-bold text-slate-900 tracking-tight leading-tight" id="header-app-title">
                أداة تصميم متجرك الإلكتروني
              </h1>
              <span class="px-2 py-0.5 text-[11px] font-semibold bg-brand-50 text-brand-700 rounded-full border border-brand-200" id="header-phase-badge">
                المرحلة الأولى Phase 1
              </span>
            </div>
            <p class="text-xs text-slate-500 font-medium" id="header-subtitle">
              تحديد المتطلبات، رحلة العميل، واعتماد النطاق
            </p>
          </div>
        </div>

        <!-- Header Actions: Autosave indicator, Language switcher, Draft Actions -->
        <div class="flex items-center gap-2 sm:gap-3">
          
          <!-- Autosave Badge -->
          <div id="autosave-indicator" class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 transition-opacity">
            <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i>
            <span id="autosave-text">تم الحفظ محلياً</span>
          </div>

          <!-- Quick JSON / Draft Menu -->
          <div class="relative inline-block text-left" id="draft-menu-container">
            <button type="button" onclick="toggleDraftMenu()" class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-500">
              <i data-lucide="folder-archive" class="w-3.5 h-3.5 text-slate-500"></i>
              <span id="draft-menu-btn-label">المسودة والملف</span>
              <i data-lucide="chevron-down" class="w-3 h-3 text-slate-400"></i>
            </button>
            <div id="draft-menu-dropdown" class="hidden absolute right-0 sm:right-auto sm:left-0 mt-2 w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 z-50">
              <div class="p-1">
                <button onclick="exportJSON(); closeDraftMenu();" class="flex items-center w-full px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 gap-2">
                  <i data-lucide="download" class="w-4 h-4 text-brand-600"></i>
                  <span id="menu-export-label">تصدير ملف المشروع (JSON)</span>
                </button>
                <label class="flex items-center w-full px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 gap-2 cursor-pointer">
                  <i data-lucide="upload" class="w-4 h-4 text-emerald-600"></i>
                  <span id="menu-import-label">استيراد ملف مشروع (JSON)</span>
                  <input type="file" id="json-file-input" accept=".json" onchange="importJSON(event)" class="hidden">
                </label>
              </div>
              <div class="p-1">
                <button onclick="window.print(); closeDraftMenu();" class="flex items-center w-full px-3 py-2 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 gap-2">
                  <i data-lucide="printer" class="w-4 h-4 text-slate-600"></i>
                  <span id="menu-print-label">طباعة / حفظ كملف PDF</span>
                </button>
                <button onclick="openResetModal(); closeDraftMenu();" class="flex items-center w-full px-3 py-2 text-xs font-medium text-rose-600 rounded-lg hover:bg-rose-50 gap-2">
                  <i data-lucide="rotate-ccw" class="w-4 h-4 text-rose-600"></i>
                  <span id="menu-reset-label">إعادة ضبط المشروع البدء من جديد</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Language Toggle Button -->
          <button type="button" onclick="toggleLanguage()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
            <i data-lucide="languages" class="w-3.5 h-3.5 text-brand-600"></i>
            <span id="lang-toggle-text">English</span>
          </button>
        </div>

      </div>
    </div>
  </header>

  <!-- STAGE STEPPER NAV -->
  <nav class="bg-white border-b border-slate-200/80 shadow-xs sticky top-16 z-30 no-print">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between overflow-x-auto py-2.5 gap-2 scrollbar-none" id="stage-stepper-container">
        <!-- Injected via renderStepper() -->
      </div>
    </div>
  </nav>

  <!-- NOTICE BANNER: Privacy & Local Storage clarity -->
  <div class="bg-blue-50/80 border-b border-blue-100 py-2 px-4 no-print">
    <div class="max-w-7xl mx-auto flex items-center justify-between text-xs text-blue-800 gap-2">
      <div class="flex items-center gap-2">
        <i data-lucide="info" class="w-4 h-4 text-blue-600 shrink-0"></i>
        <span id="banner-privacy-notice">
          ملاحظة: تُحفظ هذه البيانات محلياً داخل متصفحك الحالي تلقائياً. عند الانتهاء من المراجعة يمكنك إرسال المتطلبات مباشرة أو تصديرها كملف.
        </span>
      </div>
      <div class="hidden md:flex items-center gap-3 shrink-0 font-medium text-blue-900">
        <span id="banner-brand-preview" class="font-bold"></span>
      </div>
    </div>
  </div>

  <!-- MAIN APPLICATION CONTENT AREA -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    
    <!-- STAGE 1: Introduction & Business Information -->
    <section id="stage1-container" class="space-y-6">
      <!-- Injected by renderStage1() -->
    </section>

    <!-- STAGE 2: Interactive Customer Journey Tree -->
    <section id="stage2-container" class="space-y-6 hidden">
      <!-- Injected by renderStage2() -->
    </section>

    <!-- STAGE 3: Complete Feature Catalog -->
    <section id="stage3-container" class="space-y-6 hidden">
      <!-- Injected by renderStage3() -->
    </section>

    <!-- STAGE 4: Review, Confirmation & Submission -->
    <section id="stage4-container" class="space-y-6 hidden">
      <!-- Injected by renderStage4() -->
    </section>

  </main>

  <!-- NODE DETAILS MODAL / DRAWER -->
  <div id="node-detail-modal" class="fixed inset-0 z-50 overflow-y-auto hidden" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onclick="closeNodeModal()"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="inline-block align-bottom bg-white rounded-2xl text-start overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-slate-100">
        <div class="p-6 space-y-4" id="node-modal-content">
          <!-- Dynamic node details injected here -->
        </div>
        <div class="bg-slate-50 px-6 py-3.5 flex justify-end">
          <button type="button" onclick="closeNodeModal()" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 shadow-sm" id="node-modal-close-btn">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- DEPENDENCY WARNING MODAL -->
  <div id="dependency-modal" class="fixed inset-0 z-50 overflow-y-auto hidden">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onclick="closeDependencyModal()"></div>
      <div class="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-amber-200">
        <div class="flex items-center gap-3 text-amber-600">
          <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
            <i data-lucide="alert-circle" class="w-6 h-6"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-sm" id="dep-modal-title">تنبيه اعتمادية الميزة</h3>
            <p class="text-xs text-slate-500" id="dep-modal-subtitle">الميزة تتطلب تفعيل ميزات داعمة أخرى</p>
          </div>
        </div>
        <div id="dep-modal-content" class="text-xs text-slate-700 leading-relaxed space-y-2">
          <!-- Injected dynamic message -->
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeDependencyModal()" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg" id="dep-modal-close-btn">
            فهمت ذلك
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- RESET CONFIRMATION MODAL -->
  <div id="reset-modal" class="fixed inset-0 z-50 overflow-y-auto hidden">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onclick="closeResetModal()"></div>
      <div class="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-200">
        <div class="flex items-center gap-3 text-rose-600">
          <div class="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
            <i data-lucide="trash-2" class="w-6 h-6"></i>
          </div>
          <div>
            <h3 class="font-bold text-slate-900 text-sm" id="reset-modal-title">تأكيد إعادة ضبط المشروع</h3>
            <p class="text-xs text-slate-500" id="reset-modal-subtitle">سيتم مسح جميع الإدخالات والخيارات المحفوظة</p>
          </div>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed" id="reset-modal-desc">
          هل أنت متأكد من رغبتك في مسح كافة الخيارات المسجلة والبدء من جديد؟ لا يمكن التراجع عن هذا الإجراء بعد تنفيذه.
        </p>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" onclick="closeResetModal()" class="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg" id="reset-cancel-btn">
            إلغاء
          </button>
          <button type="button" onclick="confirmResetProject()" class="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm" id="reset-confirm-btn">
            تأكيد المسح والبدء من جديد
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- TOAST NOTIFICATION CONTAINER -->
  <div id="toast-container" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none no-print">
    <!-- Toasts injected here -->
  </div>

  <!-- FOOTER -->
  <footer class="bg-white border-t border-slate-200 py-6 mt-12 no-print">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-2">
      <p id="footer-text">
        أداة تحديد متطلبات المتجر الإلكتروني للمرحلة الأولى — مصممة خصيصاً لمواءمة الرؤية التجارية مع التنفيذ التقني الاحترافي.
      </p>
      <p class="text-slate-400 text-[11px]" id="footer-storage-note">
        جميع البيانات تحفظ بأمان داخل التخزين المحلي للمتصفح.
      </p>
    </div>
  </footer>

  <!-- EMBEDDED DATA & APPLICATION LOGIC -->
  <script>
    // -------------------------------------------------------------
    // CONFIGURATION
    // -------------------------------------------------------------
    const FORMSPREE_ENDPOINT = "https://formspree.io/f/YOUR_FORM_ID";
    const APP_SCHEMA_VERSION = "1.0.0";
    const STORAGE_KEY = "ecommerce_scope_builder_data_v1";

    // Injected Data Objects
    const FEATURES = ${JSON.stringify(FEATURES_DATA, null, 2)};
    const CATEGORIES = ${JSON.stringify(CATEGORIES_DATA, null, 2)};
    const JOURNEY_NODES = ${JSON.stringify(JOURNEY_NODES, null, 2)};

    // -------------------------------------------------------------
    // CENTRAL DATA MODEL & STATE
    // -------------------------------------------------------------
    let state = {
      language: "ar", // 'ar' or 'en'
      currentStage: 1, // 1 to 4
      
      // Contact & Business Information
      clientInfo: {
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        brandName: "",
        industry: "",
        businessDesc: "",
        targetAudience: "",
        mainGoal: "",
        expectedProducts: "10-50",
        expectedCategories: "3-8",
        preferredLanguage: "both", // 'ar', 'en', 'both'
        additionalNotes: ""
      },

      // Feature selections: { [featureId]: 'required' | 'optional' | 'not_needed' | 'undecided' }
      selections: {},

      // Custom requirements added by client
      customRequirements: [],

      // Confirmation checkbox on Stage 4
      confirmed: false,

      // Submission status tracking
      submissionState: "ready", // 'ready', 'submitting', 'success', 'failure'
      lastSubmissionTimestamp: null,
      lastSavedTimestamp: null,

      // Journey Interactive View Controls
      journeyZoom: 1,
      selectedNodeId: null
    };

    // -------------------------------------------------------------
    // TRANSLATIONS DICTIONARY
    // -------------------------------------------------------------
    const I18N = {
      ar: {
        appTitle: "أداة تصميم متجرك الإلكتروني",
        appSubtitle: "تحديد المتطلبات، رحلة العميل، واعتماد النطاق",
        phaseBadge: "المرحلة الأولى Phase 1",
        draftMenuBtn: "المسودة والملف",
        exportJSON: "تصدير ملف المشروع (JSON)",
        importJSON: "استيراد ملف مشروع (JSON)",
        printPDF: "طباعة / حفظ كملف PDF",
        resetProject: "إعادة ضبط المشروع والبدء من جديد",
        savedLocally: "تم الحفظ محلياً",
        saving: "جاري الحفظ...",
        privacyNotice: "ملاحظة: تُحفظ هذه البيانات محلياً داخل متصفحك الحالي تلقائياً. عند الانتهاء من المراجعة يمكنك إرسال المتطلبات مباشرة أو تصديرها كملف.",
        stage1Title: "1. بيانات النشاط والتواصل",
        stage2Title: "2. رحلة العميل التفاعلية",
        stage3Title: "3. كتالوج الميزات والخصائص",
        stage4Title: "4. المراجعة وتأكيد الطلب",
        
        // Stage 1
        s1HeroHeading: "لنصمم تجربة متجرك الإلكتروني معًا",
        s1HeroSub: "اختر الخصائص التي يحتاجها نشاطك التجاري، وشاهد كيف ستؤثر اختياراتك على تجربة عملائك في المتجر بدقة واحترافية.",
        s1ScopeNotice: "تنبيه هام: يغطي هذا التخطيط متجر علامتك التجارية الخاص المستقل في المرحلة الأولى، ولا يشمل منصات الأسواق متعددة البائعين (Multi-vendor Marketplace).",
        contactHeading: "بيانات التواصل الأساسية — Contact Information",
        contactSub: "بيانات للتواصل وتلقي نسخة متطلبات مشروعك.",
        clientNameLabel: "اسم العميل / المسؤول *",
        clientNamePlace: "مثال: أحمد محمد",
        clientEmailLabel: "البريد الإلكتروني *",
        clientEmailPlace: "name@company.com",
        brandNameLabel: "اسم النشاط التجاري أو البراند *",
        brandNamePlace: "مثال: لمسة عصرية للأزياء",
        clientPhoneLabel: "رقم الهاتف / واتساب (اختياري)",
        clientPhonePlace: "مثال: 01012345678",
        businessSectionHeading: "معلومات المتجر والرؤية التجارية",
        industryLabel: "مجال العمل / النشاط",
        industryPlace: "مثال: ملابس، إلكترونيات، مستحضرات تجميل، أثاث",
        businessDescLabel: "نبذة عن النشاط والمنتجات",
        businessDescPlace: "وصف موجز لطبيعة المنتجات والخدمة المقدمة للعملاء...",
        targetAudienceLabel: "الجمهور المستهدف",
        targetAudiencePlace: "مثال: شباب وبنات في مصر يبحثون عن خامات قطنية ممتازة",
        mainGoalLabel: "الهدف الرئيسي من إطلاق المتجر",
        mainGoalPlace: "مثال: نقل المبيعات من إنستاجرام لمتجر رسمي وتسهيل الطلب والدفع",
        expectedProductsLabel: "عدد المنتجات المتوقع عند الإطلاق",
        expectedCategoriesLabel: "عدد الأقسام والتصنيفات المتوقعة",
        launchLangLabel: "لغة إطلاق المتجر الأساسية",
        launchLangAr: "العربية فقط",
        launchLangEn: "الإنجليزية فقط",
        launchLangBoth: "كلا اللغتين (عربي وإنجليزي - موصى به)",
        notesLabel: "ملاحظات وتطلعات إضافية",
        notesPlace: "أي أفكار خاصة أو مواعيد إطلاق مفضلة...",
        btnNextToJourney: "متابعة إلى رحلة العميل التفاعلية ←",
        
        // Stage 2: Journey
        s2Heading: "شجرة رحلة العميل التفاعلية (Customer Journey)",
        s2Sub: "مخطط تفاعلي مباشر يوضح تجربة المشتري خطوة بخطوة من لحظة فتح المتجر وحتى إتمام الشراء، ويتحدث تلقائياً طبقاً للميزات التي تختارها.",
        zoomIn: "تكبير",
        zoomOut: "تصغير",
        fitScreen: "استعادة الحجم",
        filterAll: "كافة المحطات",
        nodeLegendAction: "إجراء من العميل",
        nodeLegendPage: "صفحة بالمتجر",
        nodeLegendDecision: "نقطة تفريع وقرار",
        nodeLegendSystem: "إجراء تقني تلقائي",
        nodeLegendAlt: "مسار بديل أو معالجة",
        nodeStatusIncluded: "مشمول في المسار",
        nodeStatusOptional: "اختياري",
        nodeStatusExcluded: "مستبعد",
        nodeClickHint: "انقر على أي محطة للاطلاع على تفاصيلها وربطها بالميزات.",
        btnPrevToStage1: "← العودة لمعلومات النشاط",
        btnNextToFeatures: "متابعة إلى كتالوج الميزات ←",

        // Stage 3: Features
        s3Heading: "كتالوج ميزات وإمكانيات المتجر",
        s3Sub: "اختر درجة أولوية كل ميزة بحرية لتحديد نطاق المرحلة الأولى. تتحدث رحلة العميل والإحصائيات مباشرة مع كل تغيير.",
        searchPlace: "ابحث في الميزات بالاسم أو الوصف (عربي أو إنجليزي)...",
        filterAllCats: "كافة الأقسام (12 قسم)",
        filterJourneyOnly: "ميزات تؤثر على رحلة العميل فقط",
        statusRequired: "مطلوب (Required)",
        statusOptional: "اختياري (Optional)",
        statusNotNeeded: "غير مطلوب (Excluded)",
        statusUndecided: "لم يحدد (Undecided)",
        priorityRequired: "مطلوب",
        priorityOptional: "اختياري",
        priorityNotNeeded: "غير مطلوب",
        priorityUndecided: "لم يحدد",
        expandAll: "توسيع الكل",
        collapseAll: "طي الكل",
        resetCategory: "إعادة ضبط القسم",
        customReqHeading: "متطلبات وأفكار إضافية خاصة بنشاطك",
        customReqSub: "أضف أي متطلب أو ميزة خاصة لم تذكر في الكتالوج أعلاه.",
        customNamePlace: "اسم الميزة أو الفكرة المطلوبة...",
        customDescPlace: "اشرح الفكرة بأسلوبك والسبب التجاري من طلبها...",
        customPriority: "الأولوية",
        customAddBtn: "+ إضافة المتطلب المخصص",
        noCustomYet: "لا توجد متطلبات مخصصة مضافة حتى الآن.",
        btnPrevToJourney: "← العودة لشجرة رحلة العميل",
        btnNextToReview: "متابعة إلى المراجعة وتأكيد النطاق ←",

        // Stage 4: Review
        s4Heading: "مراجعة وتأكيد نطاق متطلبات المتجر (المرحلة الأولى)",
        s4Sub: "راجع ملخص اختياراتك، وتأكد من توازن المتطلبات وتوافق الاعتماديات قبل الحفظ النهائي أو الإرسال.",
        clientSummaryCard: "ملخص العميل والمشروع",
        statsSummaryCard: "إحصائيات الميزات المختارة",
        depWarningsTitle: "تنبيهات وملاحظات على الاعتماديات المتبادلة",
        noDepWarnings: "جميع الميزات المختارة متوافقة تماماً ولا توجد تعارضات أو اعتماديات مفقودة.",
        journeyReviewTitle: "المحطات النشطة في رحلة العميل بعد اختياراتك",
        confirmationCheckboxText: "أؤكد أن هذه الاختيارات تعبّر عن متطلباتي المبدئية للمرحلة الأولى، وأن النطاق النهائي والتكلفة والمدة سيتم تأكيدها بشكل منفصل.",
        btnSubmitFinal: "حفظ الاختيارات وإرسال المتطلبات",
        btnExportDraftOnly: "حفظ مسودة محلية وتصدير JSON",
        submittingNotice: "جاري إرسال المتطلبات والتحقق من الاستجابة...",
        submitSuccessMsg: "تم إرسال متطلبات المشروع بنجاح. شكرًا لوقتك، وسيتم مراجعة الاختيارات وإعداد نطاق العمل والمدة والتكلفة المقترحة.",
        submitFailMsg: "لم نتمكن من إرسال المتطلبات حالياً. اختياراتك محفوظة على هذا الجهاز، ويمكنك المحاولة مرة أخرى أو تصدير ملف JSON.",
        requiredValidationWarning: "يرجى تعبئة الحقول الأساسية الإلزامية (اسم العميل، البريد، اسم البراند) والتأشير على مربع التأكيد للمتابعة."
      },
      en: {
        appTitle: "E-Commerce Scope & Journey Builder",
        appSubtitle: "Requirements Discovery, Customer Journey & Phase 1 Scope",
        phaseBadge: "Phase 1 Scope",
        draftMenuBtn: "Draft & Files",
        exportJSON: "Export Project File (JSON)",
        importJSON: "Import Project File (JSON)",
        printPDF: "Print / Save as PDF",
        resetProject: "Reset Project & Start Fresh",
        savedLocally: "Saved locally",
        saving: "Saving...",
        privacyNotice: "Note: Data is automatically preserved in your current browser session. Upon review completion, you can submit directly or export as JSON.",
        stage1Title: "1. Contact & Brand Info",
        stage2Title: "2. Customer Journey Tree",
        stage3Title: "3. Feature Catalog",
        stage4Title: "4. Review & Confirmation",
        
        // Stage 1
        s1HeroHeading: "Let's Design Your E-Commerce Experience Together",
        s1HeroSub: "Choose the features your business needs and see how your decisions directly impact your customers' storefront journey.",
        s1ScopeNotice: "Important Scope Note: This specification applies to your brand's dedicated online storefront in Phase 1, excluding multi-vendor marketplace functionality.",
        contactHeading: "Contact Information",
        contactSub: "Direct touchpoint details for receiving your store specification copy.",
        clientNameLabel: "Client / Owner Name *",
        clientNamePlace: "e.g. John Doe",
        clientEmailLabel: "Email Address *",
        clientEmailPlace: "name@company.com",
        brandNameLabel: "Business / Brand Name *",
        brandNamePlace: "e.g. Urban Threads Apparel",
        clientPhoneLabel: "Phone / WhatsApp (Optional)",
        clientPhonePlace: "e.g. +20 101 234 5678",
        businessSectionHeading: "Store Profile & Strategic Vision",
        industryLabel: "Industry / Sector",
        industryPlace: "e.g. Fashion, Electronics, Cosmetics, Furniture",
        businessDescLabel: "Brief Business Overview",
        businessDescPlace: "Short summary of your product offerings and customer promise...",
        targetAudienceLabel: "Target Audience",
        targetAudiencePlace: "e.g. Egyptian urban professionals seeking premium cotton apparel",
        mainGoalLabel: "Primary Goal for Phase 1",
        mainGoalPlace: "e.g. Migrate sales from Instagram DM orders to an automated branded storefront",
        expectedProductsLabel: "Expected SKU Count at Launch",
        expectedCategoriesLabel: "Expected Product Categories Count",
        launchLangLabel: "Primary Storefront Launch Language",
        launchLangAr: "Arabic Only",
        launchLangEn: "English Only",
        launchLangBoth: "Both Arabic & English (Recommended)",
        notesLabel: "Additional Notes & Expectations",
        notesPlace: "Any specific ideas, preferred target launch dates, or notes...",
        btnNextToJourney: "Proceed to Customer Journey Flowchart →",
        
        // Stage 2: Journey
        s2Heading: "Interactive Customer Journey Tree",
        s2Sub: "A live, visual flowchart mapping customer interactions from initial store arrival to final order fulfillment, dynamically reacting to your selected features.",
        zoomIn: "Zoom In",
        zoomOut: "Zoom Out",
        fitScreen: "Reset View",
        filterAll: "All Stages",
        nodeLegendAction: "Customer Action",
        nodeLegendPage: "Storefront Page",
        nodeLegendDecision: "Decision / Branch",
        nodeLegendSystem: "Automated System Step",
        nodeLegendAlt: "Alternative / Recovery",
        nodeStatusIncluded: "Active in Journey",
        nodeStatusOptional: "Optional Enhancement",
        nodeStatusExcluded: "Excluded",
        nodeClickHint: "Click any journey milestone to inspect details and connected feature modules.",
        btnPrevToStage1: "← Back to Business Info",
        btnNextToFeatures: "Proceed to Feature Catalog →",

        // Stage 3: Features
        s3Heading: "Complete E-Commerce Feature Catalog",
        s3Sub: "Select priority tiers for each feature to sculpt your Phase 1 store scope. The customer journey flowchart and project metrics synchronize in real time.",
        searchPlace: "Search features by keyword in Arabic or English...",
        filterAllCats: "All Categories (12)",
        filterJourneyOnly: "Affects Customer Journey Only",
        statusRequired: "Required",
        statusOptional: "Optional",
        statusNotNeeded: "Not Needed",
        statusUndecided: "Undecided",
        priorityRequired: "Required",
        priorityOptional: "Optional",
        priorityNotNeeded: "Excluded",
        priorityUndecided: "Undecided",
        expandAll: "Expand All",
        collapseAll: "Collapse All",
        resetCategory: "Reset Category",
        customReqHeading: "Custom Business Requirements",
        customReqSub: "Add bespoke capabilities or workflows tailored specifically to your operation.",
        customNamePlace: "Feature or requirement name...",
        customDescPlace: "Explain the workflow and business justification...",
        customPriority: "Priority",
        customAddBtn: "+ Add Custom Requirement",
        noCustomYet: "No custom requirements added yet.",
        btnPrevToJourney: "← Back to Journey Tree",
        btnNextToReview: "Proceed to Final Review →",

        // Stage 4: Review
        s4Heading: "Review & Confirmation of Phase 1 Scope",
        s4Sub: "Examine the finalized requirements breakdown, verify dependency warnings, and submit or export your specifications.",
        clientSummaryCard: "Client & Project Summary",
        statsSummaryCard: "Selected Features Metrics",
        depWarningsTitle: "Interdependency Notifications & Suggestions",
        noDepWarnings: "All selected features are harmoniously aligned without missing prerequisites.",
        journeyReviewTitle: "Active Customer Journey Milestones",
        confirmationCheckboxText: "I confirm that these selections represent my initial Phase 1 specifications, and that final pricing, SLA, and timeline will be validated separately.",
        btnSubmitFinal: "Save Selections & Submit Requirements",
        btnExportDraftOnly: "Save Draft & Export JSON",
        submittingNotice: "Transmitting requirements to project desk...",
        submitSuccessMsg: "Project requirements submitted successfully! Thank you. We will review your selections and assemble the detailed scope, timeline, and estimation.",
        submitFailMsg: "We could not transmit your submission right now. Your selections are safely preserved locally on this device, and you can retry or export as JSON.",
        requiredValidationWarning: "Please fill in all required fields (Client Name, Email, Brand Name) and check the confirmation box to proceed."
      }
    };

    // Helper to get translated string
    function t(key) {
      const lang = state.language || 'ar';
      return (I18N[lang] && I18N[lang][key]) || (I18N['ar'] && I18N['ar'][key]) || key;
    }

    // -------------------------------------------------------------
    // INITIALIZATION & LOCAL STORAGE
    // -------------------------------------------------------------
    function initApp() {
      // 1. Initialize default feature selections based on defaultStatus
      FEATURES.forEach(f => {
        state.selections[f.id] = f.defaultStatus || "undecided";
      });

      // 2. Load from localStorage if present
      loadFromLocalStorage();

      // 3. Apply Language Direction
      applyLanguageDirection();

      // 4. Render Initial Views
      renderStepper();
      renderCurrentStage();

      // 5. Initialize Lucide Icons
      refreshIcons();

      // 6. Autosave on any input change
      setupAutosaveListener();
    }

    function applyLanguageDirection() {
      const isAr = state.language === "ar";
      document.documentElement.lang = isAr ? "ar" : "en";
      document.documentElement.dir = isAr ? "rtl" : "ltr";
      
      const langBtn = document.getElementById("lang-toggle-text");
      if (langBtn) {
        langBtn.textContent = isAr ? "English" : "العربية";
      }

      // Update static header titles
      const appTitle = document.getElementById("header-app-title");
      if (appTitle) appTitle.textContent = t("appTitle");
      const appSubtitle = document.getElementById("header-subtitle");
      if (appSubtitle) appSubtitle.textContent = t("appSubtitle");
      const phaseBadge = document.getElementById("header-phase-badge");
      if (phaseBadge) phaseBadge.textContent = t("phaseBadge");
      const draftMenuLabel = document.getElementById("draft-menu-btn-label");
      if (draftMenuLabel) draftMenuLabel.textContent = t("draftMenuBtn");
      const menuExport = document.getElementById("menu-export-label");
      if (menuExport) menuExport.textContent = t("exportJSON");
      const menuImport = document.getElementById("menu-import-label");
      if (menuImport) menuImport.textContent = t("importJSON");
      const menuPrint = document.getElementById("menu-print-label");
      if (menuPrint) menuPrint.textContent = t("printPDF");
      const menuReset = document.getElementById("menu-reset-label");
      if (menuReset) menuReset.textContent = t("resetProject");
      const autosaveText = document.getElementById("autosave-text");
      if (autosaveText) autosaveText.textContent = t("savedLocally");
      const privacyNotice = document.getElementById("banner-privacy-notice");
      if (privacyNotice) privacyNotice.textContent = t("privacyNotice");
    }

    function toggleLanguage() {
      state.language = state.language === "ar" ? "en" : "ar";
      applyLanguageDirection();
      renderStepper();
      renderCurrentStage();
      saveToLocalStorage();
      refreshIcons();
    }

    function saveToLocalStorage() {
      try {
        state.lastSavedTimestamp = new Date().toISOString();
        const payload = {
          version: APP_SCHEMA_VERSION,
          savedAt: state.lastSavedTimestamp,
          language: state.language,
          currentStage: state.currentStage,
          clientInfo: state.clientInfo,
          selections: state.selections,
          customRequirements: state.customRequirements,
          confirmed: state.confirmed,
          lastSubmissionTimestamp: state.lastSubmissionTimestamp
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        
        // Flash autosave badge
        showAutosaveBadge();
      } catch (err) {
        console.warn("Local storage write error:", err);
      }
    }

    function loadFromLocalStorage() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const data = JSON.parse(raw);
        if (data && data.version) {
          if (data.language) state.language = data.language;
          if (data.currentStage) state.currentStage = data.currentStage;
          if (data.clientInfo) state.clientInfo = Object.assign(state.clientInfo, data.clientInfo);
          if (data.selections) state.selections = Object.assign(state.selections, data.selections);
          if (Array.isArray(data.customRequirements)) state.customRequirements = data.customRequirements;
          if (typeof data.confirmed === "boolean") state.confirmed = data.confirmed;
          if (data.lastSubmissionTimestamp) state.lastSubmissionTimestamp = data.lastSubmissionTimestamp;
        }
      } catch (err) {
        console.warn("Failed to load local storage draft:", err);
      }
    }

    function showAutosaveBadge() {
      const badge = document.getElementById("autosave-indicator");
      if (!badge) return;
      badge.classList.remove("hidden");
      badge.classList.remove("opacity-50");
      setTimeout(() => {
        badge.classList.add("opacity-50");
      }, 1500);
    }

    function setupAutosaveListener() {
      window.addEventListener("beforeunload", () => {
        saveToLocalStorage();
      });
    }

    function refreshIcons() {
      if (window.lucide && typeof window.lucide.createIcons === "function") {
        window.lucide.createIcons();
      }
    }

    // -------------------------------------------------------------
    // NAVIGATION & STAGES
    // -------------------------------------------------------------
    function setStage(stageNumber) {
      if (stageNumber < 1 || stageNumber > 4) return;
      state.currentStage = stageNumber;
      saveToLocalStorage();
      renderStepper();
      renderCurrentStage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderStepper() {
      const container = document.getElementById("stage-stepper-container");
      if (!container) return;

      const stages = [
        { num: 1, title: t("stage1Title"), icon: "briefcase" },
        { num: 2, title: t("stage2Title"), icon: "git-merge" },
        { num: 3, title: t("stage3Title"), icon: "layout-grid" },
        { num: 4, title: t("stage4Title"), icon: "clipboard-check" }
      ];

      container.innerHTML = stages.map(st => {
        const isActive = state.currentStage === st.num;
        const isPassed = state.currentStage > st.num;

        let badgeClasses = "bg-slate-100 text-slate-500 border-slate-200";
        let textClasses = "text-slate-600 font-medium hover:text-slate-900";
        if (isActive) {
          badgeClasses = "bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-500/20";
          textClasses = "text-brand-900 font-bold";
        } else if (isPassed) {
          badgeClasses = "bg-emerald-50 text-emerald-700 border-emerald-300";
          textClasses = "text-emerald-900 font-semibold";
        }

        return \`
          <button type="button" onclick="setStage(\${st.num})" class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm whitespace-nowrap transition-all \${textClasses}">
            <span class="w-6 h-6 rounded-lg flex items-center justify-center border text-xs font-bold \${badgeClasses}">
              \${isPassed ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : st.num}
            </span>
            <span>\${st.title}</span>
          </button>
        \`;
      }).join('');

      refreshIcons();
    }

    function renderCurrentStage() {
      const s1 = document.getElementById("stage1-container");
      const s2 = document.getElementById("stage2-container");
      const s3 = document.getElementById("stage3-container");
      const s4 = document.getElementById("stage4-container");

      if (s1) s1.classList.toggle("hidden", state.currentStage !== 1);
      if (s2) s2.classList.toggle("hidden", state.currentStage !== 2);
      if (s3) s3.classList.toggle("hidden", state.currentStage !== 3);
      if (s4) s4.classList.toggle("hidden", state.currentStage !== 4);

      if (state.currentStage === 1) renderStage1();
      else if (state.currentStage === 2) renderStage2();
      else if (state.currentStage === 3) renderStage3();
      else if (state.currentStage === 4) renderStage4();

      refreshIcons();
    }

    // -------------------------------------------------------------
    // STAGE 1: BUSINESS & CONTACT INFORMATION
    // -------------------------------------------------------------
    function renderStage1() {
      const container = document.getElementById("stage1-container");
      if (!container) return;

      const info = state.clientInfo;
      const isAr = state.language === "ar";

      container.innerHTML = \`
        <!-- Welcome Hero -->
        <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10 max-w-3xl space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-brand-200 border border-white/10">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-brand-300"></i>
              <span>\${isAr ? "أداة هندسة نطاق المتجر التجاري" : "E-Commerce Scope Engineering Tool"}</span>
            </div>
            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
              \${t("s1HeroHeading")}
            </h2>
            <p class="text-slate-300 text-sm sm:text-base leading-relaxed">
              \${t("s1HeroSub")}
            </p>
            <div class="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-200 text-xs flex items-center gap-2.5">
              <i data-lucide="shield-alert" class="w-4 h-4 text-amber-300 shrink-0"></i>
              <span>\${t("s1ScopeNotice")}</span>
            </div>
          </div>
        </div>

        <!-- Forms Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Contact Card (Client Info) -->
          <div class="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <div class="border-b border-slate-100 pb-4">
              <div class="flex items-center gap-2 text-brand-700 mb-1">
                <i data-lucide="user-check" class="w-5 h-5"></i>
                <h3 class="font-bold text-slate-900 text-base">\${t("contactHeading")}</h3>
              </div>
              <p class="text-xs text-slate-500">\${t("contactSub")}</p>
            </div>

            <div class="space-y-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1.5">\${t("clientNameLabel")}</label>
                <input type="text" value="\${escapeHtml(info.clientName)}" oninput="updateClientField('clientName', this.value)" placeholder="\${t("clientNamePlace")}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900 outline-none text-xs transition">
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1.5">\${t("clientEmailLabel")}</label>
                <input type="email" value="\${escapeHtml(info.clientEmail)}" oninput="updateClientField('clientEmail', this.value)" placeholder="\${t("clientEmailPlace")}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900 outline-none text-xs transition">
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1.5">\${t("brandNameLabel")}</label>
                <input type="text" value="\${escapeHtml(info.brandName)}" oninput="updateClientField('brandName', this.value)" placeholder="\${t("brandNamePlace")}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900 outline-none text-xs transition">
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1.5">\${t("clientPhoneLabel")}</label>
                <input type="tel" value="\${escapeHtml(info.clientPhone)}" oninput="updateClientField('clientPhone', this.value)" placeholder="\${t("clientPhonePlace")}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-900 outline-none text-xs transition">
              </div>
            </div>
          </div>

          <!-- Business Profile Card -->
          <div class="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-5">
            <div class="border-b border-slate-100 pb-4">
              <div class="flex items-center gap-2 text-brand-700 mb-1">
                <i data-lucide="store" class="w-5 h-5"></i>
                <h3 class="font-bold text-slate-900 text-base">\${t("businessSectionHeading")}</h3>
              </div>
              <p class="text-xs text-slate-500">\${isAr ? "تحديد طبيعة البضائع والجمهور واللغة المستهدفة" : "Define your merchandise category, audience, and scope parameters"}</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label class="block font-bold text-slate-700 mb-1.5">\${t("industryLabel")}</label>
                <input type="text" value="\${escapeHtml(info.industry)}" oninput="updateClientField('industry', this.value)" placeholder="\${t("industryPlace")}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 text-slate-900 outline-none text-xs">
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1.5">\${t("targetAudienceLabel")}</label>
                <input type="text" value="\${escapeHtml(info.targetAudience)}" oninput="updateClientField('targetAudience', this.value)" placeholder="\${t("targetAudiencePlace")}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 text-slate-900 outline-none text-xs">
              </div>

              <div class="sm:col-span-2">
                <label class="block font-bold text-slate-700 mb-1.5">\${t("businessDescLabel")}</label>
                <textarea rows="2" oninput="updateClientField('businessDesc', this.value)" placeholder="\${t("businessDescPlace")}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 text-slate-900 outline-none text-xs">\${escapeHtml(info.businessDesc)}</textarea>
              </div>

              <div class="sm:col-span-2">
                <label class="block font-bold text-slate-700 mb-1.5">\${t("mainGoalLabel")}</label>
                <input type="text" value="\${escapeHtml(info.mainGoal)}" oninput="updateClientField('mainGoal', this.value)" placeholder="\${t("mainGoalPlace")}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 text-slate-900 outline-none text-xs">
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1.5">\${t("expectedProductsLabel")}</label>
                <select onchange="updateClientField('expectedProducts', this.value)" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 text-slate-900 outline-none text-xs">
                  <option value="1-20" \${info.expectedProducts === '1-20' ? 'selected' : ''}>1 - 20 منتج (كتالوج مركز)</option>
                  <option value="20-100" \${info.expectedProducts === '20-100' ? 'selected' : ''}>20 - 100 منتج (متوسط)</option>
                  <option value="100-500" \${info.expectedProducts === '100-500' ? 'selected' : ''}>100 - 500 منتج (واسع)</option>
                  <option value="500+" \${info.expectedProducts === '500+' ? 'selected' : ''}>أكثر من 500 منتج</option>
                </select>
              </div>

              <div>
                <label class="block font-bold text-slate-700 mb-1.5">\${t("launchLangLabel")}</label>
                <select onchange="updateClientField('preferredLanguage', this.value)" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 text-slate-900 outline-none text-xs">
                  <option value="both" \${info.preferredLanguage === 'both' ? 'selected' : ''}>\${t("launchLangBoth")}</option>
                  <option value="ar" \${info.preferredLanguage === 'ar' ? 'selected' : ''}>\${t("launchLangAr")}</option>
                  <option value="en" \${info.preferredLanguage === 'en' ? 'selected' : ''}>\${t("launchLangEn")}</option>
                </select>
              </div>

              <div class="sm:col-span-2">
                <label class="block font-bold text-slate-700 mb-1.5">\${t("notesLabel")}</label>
                <textarea rows="2" oninput="updateClientField('additionalNotes', this.value)" placeholder="\${t("notesPlace")}" class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 text-slate-900 outline-none text-xs">\${escapeHtml(info.additionalNotes)}</textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="flex items-center justify-end pt-4">
          <button type="button" onclick="setStage(2)" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition">
            <span>\${t("btnNextToJourney")}</span>
            <i data-lucide="arrow-left" class="w-4 h-4 rtl:rotate-0 ltr:rotate-180"></i>
          </button>
        </div>
      \`;

      refreshIcons();
    }

    function updateClientField(field, val) {
      state.clientInfo[field] = val;
      const preview = document.getElementById("banner-brand-preview");
      if (preview && state.clientInfo.brandName) {
        preview.textContent = state.clientInfo.brandName;
      }
      saveToLocalStorage();
    }

    function escapeHtml(str) {
      if (!str) return "";
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // -------------------------------------------------------------
    // STAGE 2: INTERACTIVE CUSTOMER JOURNEY TREE
    // -------------------------------------------------------------
    function renderStage2() {
      const container = document.getElementById("stage2-container");
      if (!container) return;

      const isAr = state.language === "ar";
      const nodes = getEvaluatedJourneyNodes();

      container.innerHTML = \`
        <!-- Header -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-brand-700">
              <i data-lucide="git-pull-request" class="w-5 h-5"></i>
              <h2 class="text-xl font-bold text-slate-900">\${t("s2Heading")}</h2>
            </div>
            <p class="text-xs text-slate-500 max-w-2xl leading-relaxed">\${t("s2Sub")}</p>
          </div>

          <!-- Flowchart Controls -->
          <div class="flex items-center gap-2 shrink-0">
            <button type="button" onclick="zoomJourney(0.1)" class="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-1 shadow-xs" title="\${t("zoomIn")}">
              <i data-lucide="zoom-in" class="w-4 h-4"></i>
            </button>
            <button type="button" onclick="zoomJourney(-0.1)" class="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs flex items-center gap-1 shadow-xs" title="\${t("zoomOut")}">
              <i data-lucide="zoom-out" class="w-4 h-4"></i>
            </button>
            <button type="button" onclick="resetZoomJourney()" class="px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs">
              \${t("fitScreen")}
            </button>
          </div>
        </div>

        <!-- Legend Bar -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex flex-wrap items-center gap-4">
            <span class="font-bold text-slate-700 flex items-center gap-1.5">
              <i data-lucide="info" class="w-3.5 h-3.5 text-slate-400"></i>
              <span>\${isAr ? "دلالات الألوان في المخطط:" : "Node Legend:"}</span>
            </span>
            <span class="flex items-center gap-1.5 text-slate-600">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              \${t("nodeLegendAction")}
            </span>
            <span class="flex items-center gap-1.5 text-slate-600">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              \${t("nodeLegendPage")}
            </span>
            <span class="flex items-center gap-1.5 text-slate-600">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              \${t("nodeLegendDecision")}
            </span>
            <span class="flex items-center gap-1.5 text-slate-600">
              <span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              \${t("nodeLegendSystem")}
            </span>
            <span class="flex items-center gap-1.5 text-slate-600">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              \${t("nodeLegendAlt")}
            </span>
          </div>

          <div class="text-[11px] text-slate-400">
            \${t("nodeClickHint")}
          </div>
        </div>

        <!-- Flowchart Canvas Container -->
        <div class="bg-slate-100/70 border border-slate-300/80 rounded-2xl p-4 sm:p-6 overflow-x-auto min-h-[550px] flowchart-wrapper relative">
          <div id="journey-flow-canvas" class="flowchart-canvas space-y-8 min-w-[760px] pb-10 transition-transform origin-top" style="transform: scale(\${state.journeyZoom});">
            \${renderFlowchartStages(nodes)}
          </div>
        </div>

        <!-- Bottom Action Bar -->
        <div class="flex items-center justify-between pt-4">
          <button type="button" onclick="setStage(1)" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs">
            <i data-lucide="arrow-right" class="w-4 h-4 rtl:rotate-0 ltr:rotate-180"></i>
            <span>\${t("btnPrevToStage1")}</span>
          </button>
          <button type="button" onclick="setStage(3)" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition">
            <span>\${t("btnNextToFeatures")}</span>
            <i data-lucide="arrow-left" class="w-4 h-4 rtl:rotate-0 ltr:rotate-180"></i>
          </button>
        </div>
      \`;

      refreshIcons();
    }

    function zoomJourney(delta) {
      state.journeyZoom = Math.min(Math.max(0.6, state.journeyZoom + delta), 1.5);
      const canvas = document.getElementById("journey-flow-canvas");
      if (canvas) canvas.style.transform = \`scale(\${state.journeyZoom})\`;
    }

    function resetZoomJourney() {
      state.journeyZoom = 1;
      const canvas = document.getElementById("journey-flow-canvas");
      if (canvas) canvas.style.transform = "scale(1)";
    }

    // Dynamic Journey Evaluation: calculates status for each node based on state.selections
    function getEvaluatedJourneyNodes() {
      return JOURNEY_NODES.map(node => {
        let isIncluded = true;
        let isOptional = false;
        let isExcluded = false;

        if (node.featureId) {
          const status = state.selections[node.featureId] || "undecided";
          if (status === "not_needed") {
            isExcluded = true;
            isIncluded = false;
          } else if (status === "optional") {
            isOptional = true;
            isIncluded = true;
          } else if (status === "required") {
            isIncluded = true;
          }
        }

        // Special rule: Dynamic Auth branch
        if (node.conditionType === "dynamic_auth") {
          const guest = state.selections["feat_checkout_guest"] !== "not_needed";
          const accounts = state.selections["feat_auth_login"] !== "not_needed";
          if (!guest && !accounts) isExcluded = true;
        }

        return Object.assign({}, node, {
          isIncluded,
          isOptional,
          isExcluded
        });
      });
    }

    function renderFlowchartStages(nodes) {
      const isAr = state.language === "ar";
      
      const stages = [
        { code: "A", titleAr: "المرحلة أ: زيارة المتجر والترحيب", titleEn: "Stage A: Visiting the Store", color: "sky" },
        { code: "B", titleAr: "المرحلة ب: استكشاف الكتالوج والمنتجات", titleEn: "Stage B: Discovering Products", color: "indigo" },
        { code: "C", titleAr: "المرحلة ج: اختيار تفاصيل المنتج والمقاس", titleEn: "Stage C: Selecting a Product", color: "blue" },
        { code: "D", titleAr: "المرحلة د: مراجعة سلة المشتريات", titleEn: "Stage D: Shopping Cart", color: "amber" },
        { code: "E", titleAr: "المرحلة هـ: تحديد طريقة الشراء (زائر أم حساب)", titleEn: "Stage E: Account vs. Guest Checkout", color: "purple" },
        { code: "F", titleAr: "المرحلة و: بيانات التواصل وعنوان التوصيل", titleEn: "Stage F: Order & Shipping Information", color: "emerald" },
        { code: "G", titleAr: "المرحلة ز: اختيار وسيلة الدفع", titleEn: "Stage G: Payment Processing", color: "teal" },
        { code: "H", titleAr: "المرحلة ح: تأكيد الطلب وتوليد الفاتورة", titleEn: "Stage H: Order Review & Confirmation", color: "violet" },
        { code: "I", titleAr: "المرحلة ط: ما بعد الشراء والمتابعة", titleEn: "Stage I: Post-Purchase & Tracking", color: "rose" }
      ];

      return stages.map((st, idx) => {
        const stageNodes = nodes.filter(n => n.stage === st.code);
        if (stageNodes.length === 0) return "";

        return \`
          <div class="relative bg-white/90 backdrop-blur-xs rounded-2xl border border-slate-200 p-5 shadow-xs">
            <!-- Stage Header Badge -->
            <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <div class="flex items-center gap-2">
                <span class="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  \${st.code}
                </span>
                <h3 class="font-bold text-sm text-slate-900">\${isAr ? st.titleAr : st.titleEn}</h3>
              </div>
              <span class="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                \${stageNodes.filter(n => !n.isExcluded).length} \${isAr ? "محطة نشطة" : "active steps"}
              </span>
            </div>

            <!-- Nodes Grid / Flow for this stage -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              \${stageNodes.map(node => renderNodeCard(node)).join('')}
            </div>

            \${idx < stages.length - 1 ? \`
              <!-- Connecting Arrow between stages -->
              <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-300 shadow-xs flex items-center justify-center text-slate-400">
                <i data-lucide="arrow-down" class="w-4 h-4"></i>
              </div>
            \` : ''}
          </div>
        \`;
      }).join('');
    }

    function renderNodeCard(node) {
      const isAr = state.language === "ar";
      const title = isAr ? node.titleAr : node.titleEn;
      const desc = isAr ? node.descAr : node.descEn;

      // Color scheme based on type
      let typeBg = "bg-blue-50 text-blue-700 border-blue-200";
      let badgeLabel = isAr ? "إجراء عميل" : "Action";
      if (node.type === "page") {
        typeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
        badgeLabel = isAr ? "صفحة متجر" : "Page";
      } else if (node.type === "decision") {
        typeBg = "bg-amber-50 text-amber-700 border-amber-200";
        badgeLabel = isAr ? "نقطة تفريع" : "Decision";
      } else if (node.type === "system") {
        typeBg = "bg-indigo-50 text-indigo-700 border-indigo-200";
        badgeLabel = isAr ? "إجراء آلي" : "System";
      } else if (node.type === "alternative") {
        typeBg = "bg-rose-50 text-rose-700 border-rose-200";
        badgeLabel = isAr ? "مسار بديل" : "Alternative";
      }

      // Status indicator
      let statusBadge = \`
        <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <i data-lucide="check" class="w-2.5 h-2.5"></i>
          \${t("nodeStatusIncluded")}
        </span>
      \`;
      let opacityClass = "opacity-100";

      if (node.isExcluded) {
        statusBadge = \`
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <i data-lucide="x" class="w-2.5 h-2.5"></i>
            \${t("nodeStatusExcluded")}
          </span>
        \`;
        opacityClass = "opacity-45 bg-slate-50 border-dashed";
      } else if (node.isOptional) {
        statusBadge = \`
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <i data-lucide="help-circle" class="w-2.5 h-2.5"></i>
            \${t("nodeStatusOptional")}
          </span>
        \`;
      }

      return \`
        <div onclick="openNodeModal('\${node.id}')" class="node-card bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs cursor-pointer hover:border-brand-400 hover:shadow-md \${opacityClass} flex flex-col justify-between gap-2.5">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border \${typeBg}">
                \${badgeLabel}
              </span>
              \${statusBadge}
            </div>
            <h4 class="font-bold text-xs sm:text-sm text-slate-900 leading-snug flex items-center gap-1.5 pt-0.5">
              <i data-lucide="\${node.icon || 'circle'}" class="w-4 h-4 text-brand-600 shrink-0"></i>
              <span>\${escapeHtml(title)}</span>
            </h4>
            <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              \${escapeHtml(desc)}
            </p>
          </div>
          <div class="border-t border-slate-100 pt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>\${node.stageNameAr || ''}</span>
            <span class="text-brand-600 font-semibold flex items-center gap-0.5">
              \${isAr ? "التفاصيل" : "Details"}
              <i data-lucide="chevron-left" class="w-3 h-3 rtl:rotate-0 ltr:rotate-180"></i>
            </span>
          </div>
        </div>
      \`;
    }

    function openNodeModal(nodeId) {
      const node = JOURNEY_NODES.find(n => n.id === nodeId);
      if (!node) return;

      const isAr = state.language === "ar";
      const title = isAr ? node.titleAr : node.titleEn;
      const desc = isAr ? node.descAr : node.descEn;

      let linkedFeature = null;
      if (node.featureId) {
        linkedFeature = FEATURES.find(f => f.id === node.featureId);
      }

      const modal = document.getElementById("node-detail-modal");
      const content = document.getElementById("node-modal-content");
      if (!modal || !content) return;

      content.innerHTML = \`
        <div class="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div class="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <i data-lucide="\${node.icon || 'git-commit'}" class="w-5 h-5"></i>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">\${isAr ? "محطة رحلة العميل" : "Journey Milestone"}</span>
            <h3 class="font-bold text-base text-slate-900">\${escapeHtml(title)}</h3>
          </div>
        </div>

        <div class="space-y-3 text-xs leading-relaxed text-slate-600">
          <div>
            <h4 class="font-bold text-slate-800 mb-1">\${isAr ? "وصف التجربة للعميل:" : "Customer Experience:"}</h4>
            <p class="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-slate-700">
              \${escapeHtml(desc)}
            </p>
          </div>

          \${linkedFeature ? \`
            <div class="pt-2">
              <h4 class="font-bold text-slate-800 mb-1.5">\${isAr ? "الميزة البرمجية المرتبطة في الكتالوج:" : "Linked Feature in Scope:"}</h4>
              <div class="bg-brand-50/60 border border-brand-200/80 p-3 rounded-xl space-y-2">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-brand-900">\${escapeHtml(isAr ? linkedFeature.nameAr : linkedFeature.nameEn)}</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-brand-700 border border-brand-200">
                    \${state.selections[linkedFeature.id] ? t("priority" + capitalize(state.selections[linkedFeature.id])) : t("priorityUndecided")}
                  </span>
                </div>
                <p class="text-[11px] text-brand-700/80">
                  \${escapeHtml(isAr ? linkedFeature.descAr : linkedFeature.descEn)}
                </p>
              </div>
            </div>
          \` : \`
            <div class="text-[11px] text-slate-400 italic">
              \${isAr ? "هذه المحطة ركيزة أساسية داخل المنطق البرمجي للمتجر." : "This is an essential core step embedded in storefront architecture."}
            </div>
          \`}
        </div>
      \`;

      modal.classList.remove("hidden");
      refreshIcons();
    }

    function closeNodeModal() {
      const modal = document.getElementById("node-detail-modal");
      if (modal) modal.classList.add("hidden");
    }

    function capitalize(str) {
      if (!str) return "";
      if (str === "not_needed") return "NotNeeded";
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // -------------------------------------------------------------
    // STAGE 3: COMPLETE FEATURE CATALOG
    // -------------------------------------------------------------
    let catalogFilter = {
      search: "",
      categoryId: 0, // 0 = all
      status: "all", // 'all', 'required', 'optional', 'not_needed', 'undecided'
      journeyOnly: false,
      expandedCats: { 1: true, 2: true, 3: true, 4: true, 5: true, 6: true, 7: true, 8: true, 9: true, 10: true, 11: true, 12: true }
    };

    function renderStage3() {
      const container = document.getElementById("stage3-container");
      if (!container) return;

      const isAr = state.language === "ar";
      const totalFeats = FEATURES.length;
      const stats = getCatalogStats();

      container.innerHTML = \`
        <!-- Header & Metrics Overview -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2 text-brand-700">
                <i data-lucide="layers" class="w-5 h-5"></i>
                <h2 class="text-xl font-bold text-slate-900">\${t("s3Heading")}</h2>
              </div>
              <p class="text-xs text-slate-500 max-w-2xl leading-relaxed">\${t("s3Sub")}</p>
            </div>

            <!-- Global Action Controls -->
            <div class="flex items-center gap-2 shrink-0">
              <button type="button" onclick="toggleAllCategories(true)" class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs">
                \${t("expandAll")}
              </button>
              <button type="button" onclick="toggleAllCategories(false)" class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs">
                \${t("collapseAll")}
              </button>
            </div>
          </div>

          <!-- Counter Cards Bar -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div class="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span class="text-[11px] font-semibold text-blue-700 block">\${t("statusRequired")}</span>
                <span class="text-lg font-extrabold text-blue-900">\${stats.required}</span>
              </div>
              <span class="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                \${Math.round((stats.required / totalFeats) * 100)}%
              </span>
            </div>

            <div class="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span class="text-[11px] font-semibold text-amber-700 block">\${t("statusOptional")}</span>
                <span class="text-lg font-extrabold text-amber-900">\${stats.optional}</span>
              </div>
              <span class="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                \${Math.round((stats.optional / totalFeats) * 100)}%
              </span>
            </div>

            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span class="text-[11px] font-semibold text-slate-600 block">\${t("statusNotNeeded")}</span>
                <span class="text-lg font-extrabold text-slate-800">\${stats.not_needed}</span>
              </div>
              <span class="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                \${Math.round((stats.not_needed / totalFeats) * 100)}%
              </span>
            </div>

            <div class="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3 flex items-center justify-between">
              <div>
                <span class="text-[11px] font-semibold text-purple-700 block">\${t("statusUndecided")}</span>
                <span class="text-lg font-extrabold text-purple-900">\${stats.undecided}</span>
              </div>
              <span class="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                \${Math.round((stats.undecided / totalFeats) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          <!-- Search Input -->
          <div class="md:col-span-5 relative">
            <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute right-3.5 top-3 rtl:right-3.5 rtl:left-auto ltr:left-3.5 ltr:right-auto"></i>
            <input type="text" value="\${escapeHtml(catalogFilter.search)}" oninput="updateCatalogSearch(this.value)" placeholder="\${t("searchPlace")}" class="w-full py-2.5 rtl:pr-10 rtl:pl-3 ltr:pl-10 ltr:pr-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs">
          </div>

          <!-- Category Select -->
          <div class="md:col-span-4">
            <select onchange="updateCatalogCatFilter(this.value)" class="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-brand-500 outline-none text-xs font-medium">
              <option value="0" \${catalogFilter.categoryId === 0 ? 'selected' : ''}>\${t("filterAllCats")}</option>
              \${CATEGORIES.map(c => \`
                <option value="\${c.id}" \${catalogFilter.categoryId === c.id ? 'selected' : ''}>
                  \${c.id}. \${escapeHtml(isAr ? c.nameAr : c.nameEn)}
                </option>
              \`).join('')}
            </select>
          </div>

          <!-- Journey Only Toggle -->
          <div class="md:col-span-3 flex items-center justify-start md:justify-end">
            <label class="inline-flex items-center gap-2 cursor-pointer select-none">
              <input type="checkbox" \${catalogFilter.journeyOnly ? 'checked' : ''} onchange="toggleJourneyFilter(this.checked)" class="w-4 h-4 text-brand-600 rounded-sm border-slate-300 focus:ring-brand-500">
              <span class="font-bold text-slate-700">\${t("filterJourneyOnly")}</span>
            </label>
          </div>
        </div>

        <!-- Categories & Features List -->
        <div class="space-y-4" id="categories-list-container">
          \${renderCategoriesList()}
        </div>

        <!-- Custom Requirements Section (Category 12) -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div class="flex items-center gap-2 text-brand-700">
              <i data-lucide="plus-circle" class="w-5 h-5"></i>
              <h3 class="font-bold text-base text-slate-900">\${t("customReqHeading")}</h3>
            </div>
            <span class="text-xs text-slate-500">\${state.customRequirements.length} \${isAr ? "متطلب مضاف" : "items"}</span>
          </div>

          <p class="text-xs text-slate-500">\${t("customReqSub")}</p>

          <!-- Add Form -->
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div class="sm:col-span-8">
                <input type="text" id="custom-name-input" placeholder="\${t("customNamePlace")}" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500">
              </div>
              <div class="sm:col-span-4">
                <select id="custom-priority-select" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none font-medium">
                  <option value="required">\${t("priorityRequired")}</option>
                  <option value="optional">\${t("priorityOptional")}</option>
                  <option value="not_needed">\${t("priorityNotNeeded")}</option>
                  <option value="undecided">\${t("priorityUndecided")}</option>
                </select>
              </div>
            </div>
            <div>
              <textarea id="custom-desc-input" rows="2" placeholder="\${t("customDescPlace")}" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-brand-500"></textarea>
            </div>
            <div class="flex justify-end">
              <button type="button" onclick="addCustomRequirement()" class="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs">
                \${t("customAddBtn")}
              </button>
            </div>
          </div>

          <!-- List of Added Custom Requirements -->
          <div class="space-y-2" id="custom-requirements-list">
            \${renderCustomRequirementsList()}
          </div>
        </div>

        <!-- Navigation Action Bar -->
        <div class="flex items-center justify-between pt-4">
          <button type="button" onclick="setStage(2)" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs">
            <i data-lucide="arrow-right" class="w-4 h-4 rtl:rotate-0 ltr:rotate-180"></i>
            <span>\${t("btnPrevToJourney")}</span>
          </button>
          <button type="button" onclick="setStage(4)" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition">
            <span>\${t("btnNextToReview")}</span>
            <i data-lucide="arrow-left" class="w-4 h-4 rtl:rotate-0 ltr:rotate-180"></i>
          </button>
        </div>
      \`;

      refreshIcons();
    }

    function getCatalogStats() {
      const stats = { required: 0, optional: 0, not_needed: 0, undecided: 0 };
      FEATURES.forEach(f => {
        const s = state.selections[f.id] || "undecided";
        if (stats[s] !== undefined) stats[s]++;
      });
      return stats;
    }

    function updateCatalogSearch(val) {
      catalogFilter.search = val.trim().toLowerCase();
      renderStage3();
    }

    function updateCatalogCatFilter(val) {
      catalogFilter.categoryId = parseInt(val, 10);
      renderStage3();
    }

    function toggleJourneyFilter(checked) {
      catalogFilter.journeyOnly = checked;
      renderStage3();
    }

    function toggleAllCategories(expand) {
      CATEGORIES.forEach(c => {
        catalogFilter.expandedCats[c.id] = expand;
      });
      renderStage3();
    }

    function toggleCategoryAccordion(catId) {
      catalogFilter.expandedCats[catId] = !catalogFilter.expandedCats[catId];
      renderStage3();
    }

    function renderCategoriesList() {
      const isAr = state.language === "ar";
      let filteredCategories = CATEGORIES.filter(c => c.id !== 12); // Category 12 is custom

      if (catalogFilter.categoryId !== 0) {
        filteredCategories = filteredCategories.filter(c => c.id === catalogFilter.categoryId);
      }

      return filteredCategories.map(cat => {
        let catFeatures = FEATURES.filter(f => f.cat === cat.id);

        // Filter by journey
        if (catalogFilter.journeyOnly) {
          catFeatures = catFeatures.filter(f => f.affectsJourney);
        }

        // Filter by search
        if (catalogFilter.search) {
          catFeatures = catFeatures.filter(f => {
            const query = catalogFilter.search;
            return (f.nameAr && f.nameAr.toLowerCase().includes(query)) ||
                   (f.nameEn && f.nameEn.toLowerCase().includes(query)) ||
                   (f.descAr && f.descAr.toLowerCase().includes(query)) ||
                   (f.descEn && f.descEn.toLowerCase().includes(query));
          });
        }

        if (catFeatures.length === 0 && catalogFilter.search) return "";

        const isExpanded = catalogFilter.expandedCats[cat.id] !== false;
        const catSelectedCount = catFeatures.filter(f => state.selections[f.id] === "required").length;

        return \`
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <!-- Accordion Header -->
            <div class="px-5 py-4 bg-slate-50/60 flex items-center justify-between cursor-pointer select-none hover:bg-slate-100/60 transition" onclick="toggleCategoryAccordion(\${cat.id})">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-brand-600 flex items-center justify-center shadow-xs">
                  <i data-lucide="\${cat.icon || 'folder'}" class="w-4 h-4"></i>
                </div>
                <div>
                  <h3 class="font-bold text-sm text-slate-900 leading-tight">
                    \${cat.id}. \${escapeHtml(isAr ? cat.nameAr : cat.nameEn)}
                  </h3>
                  <p class="text-[11px] text-slate-500 mt-0.5">
                    \${escapeHtml(isAr ? cat.descAr : cat.descEn)}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200 shadow-xs">
                  \${catSelectedCount} / \${catFeatures.length} \${isAr ? "مطلوب" : "required"}
                </span>
                <i data-lucide="\${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4 text-slate-400"></i>
              </div>
            </div>

            <!-- Features Grid -->
            \${isExpanded ? \`
              <div class="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5 border-t border-slate-100">
                \${catFeatures.map(f => renderFeatureCard(f)).join('')}
              </div>
            \` : ''}
          </div>
        \`;
      }).join('');
    }

    function renderFeatureCard(f) {
      const isAr = state.language === "ar";
      const name = isAr ? f.nameAr : f.nameEn;
      const desc = isAr ? f.descAr : f.descEn;
      const currentStatus = state.selections[f.id] || "undecided";

      let statusBorder = "border-slate-200";
      if (currentStatus === "required") statusBorder = "border-blue-400 ring-1 ring-blue-100 bg-blue-50/20";
      else if (currentStatus === "optional") statusBorder = "border-amber-300 bg-amber-50/20";
      else if (currentStatus === "not_needed") statusBorder = "border-slate-200 bg-slate-50/60 opacity-60";

      return \`
        <div class="bg-white rounded-xl border p-4 shadow-xs \${statusBorder} flex flex-col justify-between gap-3 transition">
          <div class="space-y-1.5">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-mono text-slate-400 uppercase">\${f.id}</span>
              \${f.affectsJourney ? \`
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1">
                  <i data-lucide="git-branch" class="w-2.5 h-2.5"></i>
                  \${isAr ? "يؤثر على رحلة العميل" : "Affects Journey"}
                </span>
              \` : ''}
            </div>
            <h4 class="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
              \${escapeHtml(name)}
            </h4>
            <p class="text-[11px] text-slate-500 leading-relaxed">
              \${escapeHtml(desc)}
            </p>
          </div>

          <!-- Priority Selector Pill Buttons -->
          <div class="border-t border-slate-100 pt-3 flex items-center justify-between gap-1 text-[11px]">
            <span class="text-slate-400 font-semibold">\${isAr ? "الأولوية:" : "Priority:"}</span>
            <div class="flex items-center gap-1">
              <button type="button" onclick="setFeatureStatus('\${f.id}', 'required')" class="px-2.5 py-1 rounded-lg font-semibold transition \${currentStatus === 'required' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                \${t("priorityRequired")}
              </button>
              <button type="button" onclick="setFeatureStatus('\${f.id}', 'optional')" class="px-2.5 py-1 rounded-lg font-semibold transition \${currentStatus === 'optional' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                \${t("priorityOptional")}
              </button>
              <button type="button" onclick="setFeatureStatus('\${f.id}', 'not_needed')" class="px-2.5 py-1 rounded-lg font-semibold transition \${currentStatus === 'not_needed' ? 'bg-slate-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                \${t("priorityNotNeeded")}
              </button>
              <button type="button" onclick="setFeatureStatus('\${f.id}', 'undecided')" class="px-2 py-1 rounded-lg font-semibold transition \${currentStatus === 'undecided' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}" title="\${t("statusUndecided")}">
                ?
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    function setFeatureStatus(featureId, status) {
      state.selections[featureId] = status;
      saveToLocalStorage();
      
      // Check dependencies if required
      if (status === "required") {
        checkFeatureDependencies(featureId);
      }

      renderStage3();
    }

    function checkFeatureDependencies(featureId) {
      const feat = FEATURES.find(f => f.id === featureId);
      if (!feat || !Array.isArray(feat.deps) || feat.deps.length === 0) return;

      const isAr = state.language === "ar";
      const missingDeps = feat.deps.filter(depId => {
        return state.selections[depId] !== "required";
      });

      if (missingDeps.length > 0) {
        const depNames = missingDeps.map(depId => {
          const d = FEATURES.find(f => f.id === depId);
          return d ? (isAr ? d.nameAr : d.nameEn) : depId;
        });

        const modal = document.getElementById("dependency-modal");
        const content = document.getElementById("dep-modal-content");
        if (modal && content) {
          content.innerHTML = \`
            <p>\${isAr ? 'الميزة التي اخترتها (' + (isAr ? feat.nameAr : feat.nameEn) + ') تتطلب توافر الميزات التالية لتعمل بشكل سليم:' : 'The feature you selected requires the following supporting features:'}</p>
            <ul class="list-disc list-inside font-bold text-slate-800 space-y-1 pt-1">
              \${depNames.map(name => \`<li>\${escapeHtml(name)}</li>\`).join('')}
            </ul>
            <p class="text-slate-500 pt-1">\${isAr ? 'يمكنك تحديد هذه الميزات كمطلوبة لضمان تكامل التجربة دون أي خلل.' : 'You can also mark these as required to prevent architectural gaps.'}</p>
          \`;
          modal.classList.remove("hidden");
          refreshIcons();
        }
      }
    }

    function closeDependencyModal() {
      const modal = document.getElementById("dependency-modal");
      if (modal) modal.classList.add("hidden");
    }

    function addCustomRequirement() {
      const nameInput = document.getElementById("custom-name-input");
      const descInput = document.getElementById("custom-desc-input");
      const prioritySelect = document.getElementById("custom-priority-select");

      if (!nameInput || !nameInput.value.trim()) {
        showToast(state.language === "ar" ? "يرجى كتابة اسم المتطلب المخصص" : "Please provide requirement title", "warning");
        return;
      }

      const newReq = {
        id: "custom_" + Date.now(),
        name: nameInput.value.trim(),
        desc: descInput ? descInput.value.trim() : "",
        priority: prioritySelect ? prioritySelect.value : "required",
        createdAt: new Date().toISOString()
      };

      state.customRequirements.push(newReq);
      saveToLocalStorage();

      nameInput.value = "";
      if (descInput) descInput.value = "";
      renderStage3();
      showToast(state.language === "ar" ? "تم إضافة المتطلب المخصص بنجاح" : "Custom requirement added successfully", "success");
    }

    function removeCustomRequirement(id) {
      state.customRequirements = state.customRequirements.filter(r => r.id !== id);
      saveToLocalStorage();
      renderStage3();
    }

    function renderCustomRequirementsList() {
      if (state.customRequirements.length === 0) {
        return \`<p class="text-xs text-slate-400 italic py-2">\${t("noCustomYet")}</p>\`;
      }

      return state.customRequirements.map(req => {
        return \`
          <div class="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-xs">
            <div class="space-y-0.5">
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">\${escapeHtml(req.name)}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  \${t("priority" + capitalize(req.priority))}
                </span>
              </div>
              \${req.desc ? \`<p class="text-slate-500 text-[11px]">\${escapeHtml(req.desc)}</p>\` : ''}
            </div>
            <button type="button" onclick="removeCustomRequirement('\${req.id}')" class="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition" title="Delete">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        \`;
      }).join('');
    }

    // -------------------------------------------------------------
    // STAGE 4: REVIEW, CONFIRMATION & FORMSPREE SUBMISSION
    // -------------------------------------------------------------
    function renderStage4() {
      const container = document.getElementById("stage4-container");
      if (!container) return;

      const isAr = state.language === "ar";
      const info = state.clientInfo;
      const stats = getCatalogStats();
      const unresolvedDeps = findUnresolvedDependencies();
      const activeJourneyCount = getEvaluatedJourneyNodes().filter(n => !n.isExcluded).length;

      container.innerHTML = \`
        <!-- Header -->
        <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-2">
          <div class="flex items-center gap-2 text-brand-700">
            <i data-lucide="clipboard-check" class="w-5 h-5"></i>
            <h2 class="text-xl font-bold text-slate-900">\${t("s4Heading")}</h2>
          </div>
          <p class="text-xs text-slate-500 max-w-2xl leading-relaxed">\${t("s4Sub")}</p>
        </div>

        <!-- Submission Status Alerts -->
        <div id="submission-status-banner">
          \${renderSubmissionAlert()}
        </div>

        <!-- Review Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Column 1: Client & Stats Overview (5 cols) -->
          <div class="lg:col-span-5 space-y-5">
            
            <!-- Contact Card Summary -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <i data-lucide="user" class="w-4 h-4 text-brand-600"></i>
                  <span>\${t("clientSummaryCard")}</span>
                </h3>
                <button type="button" onclick="setStage(1)" class="text-xs font-semibold text-brand-600 hover:underline">
                  \${isAr ? "تعديل" : "Edit"}
                </button>
              </div>

              <div class="space-y-2 text-xs">
                <div class="flex justify-between py-1 border-b border-slate-50">
                  <span class="text-slate-500">\${t("clientNameLabel")}</span>
                  <span class="font-bold text-slate-900">\${escapeHtml(info.clientName) || '<span class="text-rose-500 font-normal">' + (isAr ? "غير محدد *" : "Required *") + '</span>'}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-50">
                  <span class="text-slate-500">\${t("clientEmailLabel")}</span>
                  <span class="font-bold text-slate-900">\${escapeHtml(info.clientEmail) || '<span class="text-rose-500 font-normal">' + (isAr ? "غير محدد *" : "Required *") + '</span>'}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-50">
                  <span class="text-slate-500">\${t("brandNameLabel")}</span>
                  <span class="font-bold text-slate-900">\${escapeHtml(info.brandName) || '<span class="text-rose-500 font-normal">' + (isAr ? "غير محدد *" : "Required *") + '</span>'}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-50">
                  <span class="text-slate-500">\${t("clientPhoneLabel")}</span>
                  <span class="font-bold text-slate-700">\${escapeHtml(info.clientPhone) || '-'}</span>
                </div>
                <div class="flex justify-between py-1 border-b border-slate-50">
                  <span class="text-slate-500">\${t("industryLabel")}</span>
                  <span class="font-bold text-slate-700">\${escapeHtml(info.industry) || '-'}</span>
                </div>
                <div class="flex justify-between py-1">
                  <span class="text-slate-500">\${t("expectedProductsLabel")}</span>
                  <span class="font-bold text-slate-700">\${escapeHtml(info.expectedProducts)}</span>
                </div>
              </div>
            </div>

            <!-- Features Stats Summary Card -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
              <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <i data-lucide="pie-chart" class="w-4 h-4 text-brand-600"></i>
                  <span>\${t("statsSummaryCard")}</span>
                </h3>
                <button type="button" onclick="setStage(3)" class="text-xs font-semibold text-brand-600 hover:underline">
                  \${isAr ? "تعديل" : "Edit"}
                </button>
              </div>

              <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900">
                  <span class="text-[10px] text-blue-700 block font-semibold">\${t("statusRequired")}</span>
                  <span class="text-base font-extrabold">\${stats.required}</span>
                </div>
                <div class="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900">
                  <span class="text-[10px] text-amber-700 block font-semibold">\${t("statusOptional")}</span>
                  <span class="text-base font-extrabold">\${stats.optional}</span>
                </div>
                <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800">
                  <span class="text-[10px] text-slate-500 block font-semibold">\${t("statusNotNeeded")}</span>
                  <span class="text-base font-extrabold">\${stats.not_needed}</span>
                </div>
                <div class="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-purple-900">
                  <span class="text-[10px] text-purple-700 block font-semibold">\${t("statusUndecided")}</span>
                  <span class="text-base font-extrabold">\${stats.undecided}</span>
                </div>
              </div>

              <div class="pt-1 text-[11px] text-slate-500 flex items-center justify-between">
                <span>\${isAr ? "المحطات النشطة برحلة العميل:" : "Active Journey Steps:"}</span>
                <span class="font-bold text-brand-700">\${activeJourneyCount} \${isAr ? "محطة" : "milestones"}</span>
              </div>
            </div>

            <!-- Custom Requirements Preview -->
            \${state.customRequirements.length > 0 ? \`
              <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
                <h4 class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-brand-600"></i>
                  <span>\${t("customReqHeading")} (\${state.customRequirements.length})</span>
                </h4>
                <div class="space-y-1.5 text-xs">
                  \${state.customRequirements.map(r => \`
                    <div class="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                      <div class="font-bold text-slate-800">\${escapeHtml(r.name)}</div>
                      \${r.desc ? \`<div class="text-[11px] text-slate-500 mt-0.5">\${escapeHtml(r.desc)}</div>\` : ''}
                    </div>
                  \`).join('')}
                </div>
              </div>
            \` : ''}

          </div>

          <!-- Column 2: Dependency Warnings & Detailed Breakdown (7 cols) -->
          <div class="lg:col-span-7 space-y-5">
            
            <!-- Dependency Advisory Card -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 class="font-bold text-slate-900 text-sm flex items-center gap-2">
                <i data-lucide="git-branch" class="w-4 h-4 text-amber-500"></i>
                <span>\${t("depWarningsTitle")}</span>
              </h3>

              \${unresolvedDeps.length > 0 ? \`
                <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <p class="font-semibold">\${isAr ? "تم رصد الملاحظات التالية على توافق بعض الميزات:" : "The following feature dependencies require attention:"}</p>
                  <ul class="list-disc list-inside space-y-1 text-[11px]">
                    \${unresolvedDeps.map(w => \`<li>\${escapeHtml(w)}</li>\`).join('')}
                  </ul>
                </div>
              \` : \`
                <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                  <span>\${t("noDepWarnings")}</span>
                </div>
              \`}
            </div>

            <!-- Features Summary by Category Accordion / List -->
            <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <h3 class="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span class="flex items-center gap-2">
                  <i data-lucide="check-square" class="w-4 h-4 text-brand-600"></i>
                  <span>\${isAr ? "تفاصيل الميزات المطلوبة بحسب القسم" : "Required Features by Category"}</span>
                </span>
                <span class="text-xs font-semibold text-brand-700">\${stats.required} \${isAr ? "ميزة مطلوب" : "items"}</span>
              </h3>

              <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                \${renderRequiredFeaturesByCategory()}
              </div>
            </div>

          </div>

        </div>

        <!-- Final Confirmation Box & Formspree Submit Action -->
        <div class="bg-white rounded-2xl border-2 border-brand-500/30 p-6 sm:p-8 shadow-md space-y-6">
          <div class="space-y-4">
            <label class="flex items-start gap-3 cursor-pointer select-none">
              <input type="checkbox" id="client-confirm-checkbox" \${state.confirmed ? 'checked' : ''} onchange="toggleClientConfirmation(this.checked)" class="w-5 h-5 mt-0.5 text-brand-600 rounded border-slate-300 focus:ring-brand-500">
              <span class="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
                \${t("confirmationCheckboxText")}
              </span>
            </label>
            <p class="text-[11px] text-slate-400">
              \${isAr ? "هذا التأكيد يمثل اتفاقاً مبدئياً على المواصفات الفنية لإنشاء العرض الفني والمالي الرسمي للمشروع." : "This confirmation represents preliminary requirements agreement for preparing the official technical & financial proposal."}
            </p>
          </div>

          <div class="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button type="button" onclick="exportJSON()" class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs">
              <i data-lucide="download" class="w-4 h-4 text-brand-600"></i>
              <span>\${t("btnExportDraftOnly")}</span>
            </button>

            <button type="button" id="final-submit-btn" onclick="submitFinalRequirements()" \${state.submissionState === 'submitting' ? 'disabled' : ''} class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:bg-slate-400 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition">
              <i data-lucide="\${state.submissionState === 'submitting' ? 'loader-2' : 'send'}" class="w-4 h-4 \${state.submissionState === 'submitting' ? 'animate-spin' : ''}"></i>
              <span id="submit-btn-text">\${state.submissionState === 'submitting' ? t("submittingNotice") : t("btnSubmitFinal")}</span>
            </button>
          </div>
        </div>
      \`;

      refreshIcons();
    }

    function toggleClientConfirmation(checked) {
      state.confirmed = checked;
      saveToLocalStorage();
    }

    function renderRequiredFeaturesByCategory() {
      const isAr = state.language === "ar";
      return CATEGORIES.filter(c => c.id !== 12).map(cat => {
        const catReqs = FEATURES.filter(f => f.cat === cat.id && state.selections[f.id] === "required");
        if (catReqs.length === 0) return "";

        return \`
          <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
            <div class="font-bold text-slate-900 flex items-center justify-between">
              <span>\${cat.id}. \${escapeHtml(isAr ? cat.nameAr : cat.nameEn)}</span>
              <span class="text-[10px] text-slate-500 font-semibold">\${catReqs.length}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 pt-1">
              \${catReqs.map(f => \`
                <span class="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px]">
                  \${escapeHtml(isAr ? f.nameAr : f.nameEn)}
                </span>
              \`).join('')}
            </div>
          </div>
        \`;
      }).join('');
    }

    function findUnresolvedDependencies() {
      const warnings = [];
      const isAr = state.language === "ar";

      FEATURES.forEach(f => {
        if (state.selections[f.id] === "required" && Array.isArray(f.deps)) {
          f.deps.forEach(depId => {
            if (state.selections[depId] !== "required") {
              const depFeat = FEATURES.find(x => x.id === depId);
              const depName = depFeat ? (isAr ? depFeat.nameAr : depFeat.nameEn) : depId;
              const featName = isAr ? f.nameAr : f.nameEn;
              warnings.push(isAr ? 
                \`الميزة "\${featName}" تتطلب تفعيل ميزة "\${depName}".\` : 
                \`"\${featName}" requires "\${depName}".\`
              );
            }
          });
        }
      });

      // Special payment check: at least one payment method should be selected
      const payCod = state.selections["feat_pay_cod"] === "required";
      const payOnline = state.selections["feat_pay_gateway"] === "required";
      const payWallets = state.selections["feat_pay_wallets"] === "required";
      const payTransfer = state.selections["feat_pay_bank_transfer"] === "required";

      if (!payCod && !payOnline && !payWallets && !payTransfer) {
        warnings.push(isAr ? 
          "لم يتم تحديد أي وسيلة دفع كمطلوبة في المرحلة الأولى (ينصح بتفعيل الدفع عند الاستلام كحد أدنى)." : 
          "No payment method marked as required (Cash on Delivery recommended as minimum baseline)."
        );
      }

      return warnings;
    }

    function renderSubmissionAlert() {
      if (state.submissionState === "success") {
        return \`
          <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3 shadow-xs">
            <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"></i>
            <div class="space-y-1 text-xs">
              <h4 class="font-bold text-sm">\${state.language === 'ar' ? 'تم الإرسال بنجاح' : 'Submission Successful'}</h4>
              <p class="leading-relaxed">\${t("submitSuccessMsg")}</p>
              \${state.lastSubmissionTimestamp ? \`<p class="text-[10px] text-emerald-700 font-mono">Timestamp: \${state.lastSubmissionTimestamp}</p>\` : ''}
            </div>
          </div>
        \`;
      } else if (state.submissionState === "failure") {
        return \`
          <div class="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-start gap-3 shadow-xs">
            <i data-lucide="alert-octagon" class="w-5 h-5 text-rose-600 shrink-0 mt-0.5"></i>
            <div class="space-y-1 text-xs">
              <h4 class="font-bold text-sm">\${state.language === 'ar' ? 'تعذر الإرسال' : 'Submission Error'}</h4>
              <p class="leading-relaxed">\${t("submitFailMsg")}</p>
            </div>
          </div>
        \`;
      }
      return "";
    }

    // -------------------------------------------------------------
    // FORMSPREE SUBMISSION LOGIC
    // -------------------------------------------------------------
    async function submitFinalRequirements() {
      const isAr = state.language === "ar";

      // 1. Validation
      const info = state.clientInfo;
      if (!info.clientName || !info.clientName.trim() ||
          !info.clientEmail || !info.clientEmail.trim() ||
          !info.brandName || !info.brandName.trim()) {
        showToast(t("requiredValidationWarning"), "warning");
        setStage(1);
        return;
      }

      // Email format validation
      const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailRegex.test(info.clientEmail)) {
        showToast(isAr ? "يرجى إدخال بريد إلكتروني صحيح" : "Please provide a valid email address", "warning");
        setStage(1);
        return;
      }

      // Confirmation checkbox validation
      if (!state.confirmed) {
        showToast(isAr ? "يرجى التأشير على مربع تأكيد صحة الاختيارات قبل المتابعة" : "Please tick the confirmation checkbox before submitting", "warning");
        return;
      }

      // 2. Prepare Payload
      state.submissionState = "submitting";
      renderStage4();

      const stats = getCatalogStats();
      const unresolvedDeps = findUnresolvedDependencies();

      // Compile Human-Readable Summary text for Formspree email templates
      let readableSummary = \`=== متطلبات مشروع متجر إلكتروني - المرحلة الأولى ===\\n\`;
      readableSummary += \`العميل: \${info.clientName}\\n\`;
      readableSummary += \`البريد: \${info.clientEmail}\\n\`;
      readableSummary += \`الهاتف: \${info.clientPhone || 'غير مدخل'}\\n\`;
      readableSummary += \`البراند: \${info.brandName}\\n\`;
      readableSummary += \`مجال العمل: \${info.industry || 'غير مدخل'}\\n\\n\`;
      readableSummary += \`إحصائيات الميزات:\\n\`;
      readableSummary += \`- مطلوب: \${stats.required}\\n\`;
      readableSummary += \`- اختياري: \${stats.optional}\\n\`;
      readableSummary += \`- غير مطلوب: \${stats.not_needed}\\n\`;
      readableSummary += \`- لم يحدد: \${stats.undecided}\\n\\n\`;
      
      readableSummary += \`الميزات المطلوبة بحسب التصنيف:\\n\`;
      CATEGORIES.forEach(c => {
        const reqs = FEATURES.filter(f => f.cat === c.id && state.selections[f.id] === "required");
        if (reqs.length > 0) {
          readableSummary += \`[\${c.nameAr}]: \${reqs.map(r => r.nameAr).join('، ')}\\n\`;
        }
      });

      if (state.customRequirements.length > 0) {
        readableSummary += \`\\nالمتطلبات المخصصة:\\n\`;
        state.customRequirements.forEach((r, idx) => {
          readableSummary += \`\${idx + 1}. \${r.name}: \${r.desc || ''} (أولوية: \${r.priority})\\n\`;
        });
      }

      const payload = {
        _subject: \`متطلبات متجر \${info.brandName} - \${info.clientName}\`,
        client_name: info.clientName,
        client_email: info.clientEmail,
        client_phone: info.clientPhone || "",
        brand_name: info.brandName,
        industry: info.industry || "",
        business_description: info.businessDesc || "",
        target_audience: info.targetAudience || "",
        main_goal: info.mainGoal || "",
        expected_products: info.expectedProducts,
        preferred_language: info.preferredLanguage,
        additional_notes: info.additionalNotes || "",
        submission_timestamp: new Date().toISOString(),
        schema_version: APP_SCHEMA_VERSION,
        confirmed_by_client: state.confirmed,
        statistics: stats,
        unresolved_dependencies: unresolvedDeps,
        human_readable_summary: readableSummary,
        feature_selections: state.selections,
        custom_requirements: state.customRequirements
      };

      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.errors?.map(err => err.message).join(", ") ||
            "Submission failed. Please try again."
          );
        }

        // Success
        state.submissionState = "success";
        state.lastSubmissionTimestamp = new Date().toISOString();
        saveToLocalStorage();
        renderStage4();
        showToast(t("submitSuccessMsg"), "success");
      } catch (err) {
        console.warn("Formspree submission error:", err);
        state.submissionState = "failure";
        saveToLocalStorage();
        renderStage4();
        showToast(t("submitFailMsg"), "error");
      }
    }

    // -------------------------------------------------------------
    // EXPORT, IMPORT, RESET & UTILS
    // -------------------------------------------------------------
    function exportJSON() {
      const payload = {
        version: APP_SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        language: state.language,
        clientInfo: state.clientInfo,
        selections: state.selections,
        customRequirements: state.customRequirements,
        confirmed: state.confirmed
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
      const downloadAnchor = document.createElement("a");
      const filename = \`ecommerce-scope-\${(state.clientInfo.brandName || "project").replace(/\\s+/g, "_")}-\${new Date().toISOString().slice(0, 10)}.json\`;
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast(state.language === "ar" ? "تم تصدير ملف JSON بنجاح" : "JSON project file exported successfully", "success");
    }

    function importJSON(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const parsed = JSON.parse(e.target.result);
          if (!parsed || typeof parsed !== "object") throw new Error("Invalid format");

          if (parsed.clientInfo) state.clientInfo = Object.assign(state.clientInfo, parsed.clientInfo);
          if (parsed.selections) state.selections = Object.assign(state.selections, parsed.selections);
          if (Array.isArray(parsed.customRequirements)) state.customRequirements = parsed.customRequirements;
          if (typeof parsed.confirmed === "boolean") state.confirmed = parsed.confirmed;
          if (parsed.language) state.language = parsed.language;

          saveToLocalStorage();
          applyLanguageDirection();
          renderStepper();
          renderCurrentStage();

          showToast(state.language === "ar" ? "تم استيراد بيانات المشروع بنجاح" : "Project restored successfully", "success");
        } catch (err) {
          showToast(state.language === "ar" ? "تعذر قراءة الملف: تأكد من صحة تنسيق JSON" : "Invalid JSON file structure", "error");
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    }

    function openResetModal() {
      const modal = document.getElementById("reset-modal");
      if (modal) modal.classList.remove("hidden");
    }

    function closeResetModal() {
      const modal = document.getElementById("reset-modal");
      if (modal) modal.classList.add("hidden");
    }

    function confirmResetProject() {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }

    function toggleDraftMenu() {
      const menu = document.getElementById("draft-menu-dropdown");
      if (menu) menu.classList.toggle("hidden");
    }

    function closeDraftMenu() {
      const menu = document.getElementById("draft-menu-dropdown");
      if (menu) menu.classList.add("hidden");
    }

    // Close menu when clicking outside
    window.addEventListener("click", function(e) {
      const container = document.getElementById("draft-menu-container");
      if (container && !container.contains(e.target)) {
        closeDraftMenu();
      }
    });

    function showToast(message, type = "info") {
      const container = document.getElementById("toast-container");
      if (!container) return;

      const toast = document.createElement("div");
      let bg = "bg-slate-900 text-white border-slate-700";
      if (type === "success") bg = "bg-emerald-900 text-emerald-100 border-emerald-700";
      else if (type === "warning") bg = "bg-amber-900 text-amber-100 border-amber-700";
      else if (type === "error") bg = "bg-rose-900 text-rose-100 border-rose-700";

      toast.className = \`p-3.5 rounded-xl border text-xs shadow-xl transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto max-w-xs leading-relaxed \${bg}\`;
      toast.textContent = message;

      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.remove("translate-y-2", "opacity-0");
      }, 10);

      setTimeout(() => {
        toast.classList.add("translate-y-2", "opacity-0");
        setTimeout(() => toast.remove(), 300);
      }, 4000);
    }

    // -------------------------------------------------------------
    // START APPLICATION ON LOAD
    // -------------------------------------------------------------
    document.addEventListener("DOMContentLoaded", initApp);
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), htmlContent, 'utf8');
console.log('Successfully generated index.html!');
