# 🏥 Hospital Management System (HMS)

## نظام إدارة المستشفيات المتكامل

> مشروع تخرج — نظام شامل لإدارة جميع العمليات داخل المستشفى بأحدث التقنيات

---

## 📌 نظرة عامة | Project Overview

نظام إدارة المستشفيات (HMS) هو تطبيق ويب متكامل يهدف إلى رقمنة وأتمتة جميع العمليات اليومية داخل المستشفى. يوفر النظام واجهات مخصصة لـ **8 أدوار مختلفة** من المستخدمين، مع نظام أمان متقدم يعتمد على JWT و Role-Based Access Control.

### 🎯 المشكلة | Problem Statement

- إدارة المستشفيات يدوياً تؤدي إلى أخطاء بشرية وتأخير في الخدمة
- صعوبة تتبع المرضى والمواعيد والأدوية بشكل دقيق
- عدم وجود نظام موحد يربط بين الأقسام المختلفة
- صعوبة إصدار الفواتير وتتبع المدفوعات

### ✅ الحل | Solution

نظام رقمي شامل يربط جميع أقسام المستشفى في منصة واحدة آمنة وسهلة الاستخدام.

---

## 🏗️ معمارية النظام | System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    🖥️ Frontend (React + TypeScript)          │
│              Vite • shadcn/ui • Tailwind CSS • Axios         │
│                    Port: 5173 (Development)                   │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API (JSON)
                          │ JWT Bearer Token
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                  ⚙️ Backend (Spring Boot 4.0.2)              │
│         Java 17 • Spring Security • Spring Data JPA          │
│                     Port: 8080                                │
└─────────────────────────┬───────────────────────────────────┘
                          │ JPA / Hibernate
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    🗄️ Database (MySQL 8.x)                   │
│              20+ Tables • Relational Schema                   │
│                    Port: 3306                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ التقنيات المستخدمة | Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 17 | لغة البرمجة الأساسية |
| Spring Boot | 4.0.2 | إطار العمل الأساسي |
| Spring Security | Latest | الأمان والمصادقة |
| Spring Data JPA | Latest | الوصول لقاعدة البيانات |
| JWT (jjwt) | 0.12.6 | JSON Web Tokens |
| MySQL | 8.x | قاعدة البيانات |
| Hibernate | Latest | ORM Framework |
| Lombok | Latest | تقليل الكود المتكرر |
| Swagger/OpenAPI | 2.5.0 | توثيق الـ API |
| Maven | 3.x | إدارة المشروع |
| BCrypt | — | تشفير كلمات المرور |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3 | مكتبة واجهة المستخدم |
| TypeScript | 5.8 | Type Safety |
| Vite | 5.4 | أداة البناء السريعة |
| Tailwind CSS | 3.4 | تنسيق الواجهة |
| shadcn/ui | Latest | مكونات UI جاهزة |
| Radix UI | Latest | مكونات Accessible |
| React Router | 6.30 | التنقل بين الصفحات |
| TanStack Query | 5.83 | إدارة حالة السيرفر |
| Axios | 1.7 | طلبات HTTP |
| React Hook Form | 7.61 | إدارة النماذج |
| Zod | 3.25 | التحقق من البيانات |
| Recharts | 2.15 | الرسوم البيانية |
| Lucide React | Latest | الأيقونات |
| date-fns | 3.6 | معالجة التواريخ |

---

## 👥 أدوار المستخدمين | User Roles (8 Roles)

### 1. 🔑 المدير (Admin)
- إدارة جميع المستخدمين (إضافة، تعديل، حذف)
- إدارة الأقسام والتخصصات
- مراقبة المواعيد والمعاملات المالية
- إدارة الأسرّة والأدوية
- لوحة تحليلات شاملة (Analytics Dashboard)
- إدارة العمليات والتشخيصات

### 2. 👨‍⚕️ الطبيب (Doctor)
- عرض وإدارة قائمة المرضى
- إدارة المواعيد (تأكيد، إكمال، إلغاء)
- كتابة الوصفات الطبية
- طلب فحوصات مخبرية
- إدارة طلبات الإدخال
- إنشاء التقارير الطبية
- استقبال الإشعارات

### 3. 🏥 الاستقبال (Receptionist)
- تسجيل مرضى جدد
- البحث عن المرضى
- جدولة المواعيد
- إجراءات خروج المرضى (Checkout)

### 4. 🤒 المريض (Patient)
- عرض لوحة المعلومات الشخصية
- حجز ومتابعة المواعيد
- عرض الوصفات الطبية
- الاطلاع على السجل الطبي
- متابعة الفواتير والمدفوعات
- استقبال الإشعارات

### 5. 👩‍⚕️ الممرض/ة (Nurse)
- متابعة حالة المرضى
- إدارة وإعطاء الأدوية
- تحديث العلامات الحيوية

### 6. 💊 الصيدلي (Pharmacist)
- إدارة مخزون الأدوية
- عرض الوصفات الطبية الواردة
- صرف الأدوية للمرضى
- متابعة تواريخ الصلاحية

### 7. 💰 المحاسب (Accountant)
- إصدار وإدارة الفواتير
- تسجيل المدفوعات
- متابعة الحالة المالية للمرضى
- استقبال الإشعارات المالية

### 8. 🔬 فني المختبر (Technician)
- استقبال طلبات الفحوصات
- رفع نتائج التحاليل
- إدارة حالة الطلبات
- استقبال الإشعارات

---

## 🔐 نظام الأمان | Security System

### المصادقة (Authentication)
```
┌──────────┐    Login Request     ┌──────────────┐
│  Client  │ ──────────────────► │  Auth Server  │
│          │                      │              │
│          │ ◄────────────────── │              │
└──────────┘  Access Token (15m)  └──────────────┘
              + Refresh Token (7d)
```

- **Access Token**: صلاحية 15 دقيقة — لحماية كل طلب API
- **Refresh Token**: صلاحية 7 أيام — لتجديد الـ Access Token تلقائياً
- **BCrypt Encryption**: تشفير كلمات المرور بخوارزمية BCrypt
- **Stateless Sessions**: لا يتم تخزين جلسات على السيرفر

### التفويض (Authorization)
- **Role-Based Access Control (RBAC)**: كل endpoint محمي بصلاحيات محددة
- **Method-Level Security**: حماية على مستوى الـ HTTP Method (GET, POST, PUT, DELETE)
- **Protected Routes**: حماية صفحات الفرونت إند بناءً على الدور

### مميزات أمنية إضافية
- تجديد تلقائي للـ Token عند انتهاء الصلاحية
- طابور (Queue) لإدارة الطلبات أثناء تجديد التوكن
- تسجيل خروج آمن مع إبطال جميع التوكنات
- CORS مُعدّ للسماح فقط بالنطاقات المعتمدة

---

## 📊 قاعدة البيانات | Database Design

### مخطط العلاقات (ERD Summary)

```
users (Base Table)
├── patients        (extends users — JOINED inheritance)
├── doctors         (extends users)
├── nurses          (extends users)
├── pharmacists     (extends users)
├── accountants     (extends users)
├── technicians     (extends users)
├── receptionists   (extends users)
└── admins          (extends users)

appointments        → patients, doctors
prescriptions       → patients, doctors, pharmacists
prescription_items  → prescriptions, medicines
medicine            → medicine_categories, medicine_stocks
medicine_stock      → medicine
medicine_dispensation → patients, prescriptions, pharmacists
beds               → patients
departments        → doctors, nurses, pharmacists
specialities       → doctors, nurses
invoices           → patients, accountants
invoice_items      → invoices
payments           → invoices, patients
test_requests      → patients, doctors, technicians
notifications      → users (recipients)
refresh_tokens     → users
```

### جداول رئيسية (20+ جدول)
| الجدول | الوصف |
|--------|-------|
| users | الجدول الأساسي لجميع المستخدمين |
| patients | بيانات المرضى (العلامات الحيوية، التأمين، الحساسية) |
| doctors | بيانات الأطباء (التخصص، الترخيص، الخبرة) |
| appointments | المواعيد (التاريخ، الوقت، النوع، الحالة) |
| prescriptions | الوصفات الطبية |
| medicine | الأدوية ومعلوماتها |
| medicine_stock | مخزون الأدوية (الكمية، السعر، الصلاحية) |
| invoices | الفواتير المالية |
| payments | المدفوعات (نقدي، بطاقة، تأمين، تحويل بنكي) |
| test_requests | طلبات الفحوصات المخبرية |
| beds | إدارة الأسرّة |
| departments | الأقسام |
| notifications | الإشعارات |

---

## 🌟 المميزات الرئيسية | Key Features

### 📋 إدارة المواعيد
- حجز مواعيد جديدة (استشارة، متابعة، طوارئ)
- تأكيد وإلغاء وإكمال المواعيد
- فلترة حسب التاريخ والقسم والحالة
- إشعارات تلقائية للطبيب والمريض

### 💊 إدارة الصيدلية
- كتالوج أدوية شامل مع التصنيفات
- إدارة المخزون (الكمية، الحد الأدنى، الصلاحية)
- صرف الأدوية من الوصفات الطبية
- تتبع حركة الأدوية والمبيعات
- تنبيهات انخفاض المخزون

### 🧾 الفوترة والمدفوعات
- إصدار فواتير تلقائية
- دعم طرق دفع متعددة (نقدي، بطاقة، تأمين، تحويل بنكي)
- حساب تلقائي للمبالغ المتبقية
- تتبع حالة الفواتير (معلقة، جزئي، مدفوعة)
- ربط تلقائي بخدمات الصيدلية والمختبر

### 🔬 المختبر والفحوصات
- أنواع فحوصات متعددة (تحليل دم، أشعة، MRI، CT Scan)
- نظام أولويات (عادي، عاجل)
- رفع نتائج وتقارير الفحوصات
- تتبع حالة الفحص من الطلب للاكتمال

### 🛏️ إدارة الأسرّة
- عرض توفر الأسرّة بالأجنحة
- تخصيص وتحرير الأسرّة
- حالات: متاح، مشغول، صيانة

### 📱 الإشعارات
- إشعارات فورية داخل النظام
- أنواع متعددة: معلومات، تحذير، نجاح، خطأ
- تمييز المقروء وغير المقروء
- روابط إجراءات مباشرة

### 📊 لوحة التحليلات (Admin)
- رسوم بيانية تفاعلية (Recharts)
- إحصائيات المرضى والمواعيد
- تقارير مالية
- مؤشرات أداء النظام

### 🌙 الوضع الداكن
- دعم Dark/Light Mode
- تخزين التفضيل محلياً

---

## 🔄 سير العمل | Workflow Examples

### سير عمل المريض الكامل
```
تسجيل المريض (Receptionist)
    │
    ▼
حجز موعد (Receptionist/Patient)
    │
    ▼
الكشف الطبي (Doctor)
    │
    ├──► كتابة وصفة طبية ──► صرف أدوية (Pharmacist)
    │
    ├──► طلب فحوصات ──► إجراء الفحص (Technician) ──► رفع النتائج
    │
    ├──► طلب إدخال ──► تخصيص سرير (Nurse)
    │
    └──► إصدار فاتورة (Accountant) ──► الدفع ──► خروج المريض
```

### سير عمل الوصفة الطبية
```
Doctor: كتابة الوصفة ──► Pharmacist: مراجعة ──► صرف الأدوية ──► تحديث المخزون ──► إنشاء بند فاتورة
```

---

## 🗂️ هيكل المشروع | Project Structure

```
HMS/
├── 📁 Back-End/
│   └── hospital-management-system-main/
│       ├── pom.xml                          # Maven dependencies
│       └── src/main/java/com/hospital/hms/
│           ├── config/                       # Security, CORS, Async, Seeder
│           ├── controller/    (18 files)     # REST API endpoints
│           ├── service/       (22 files)     # Business logic
│           ├── repository/    (15+ files)    # Data access layer
│           ├── entity/        (20+ files)    # JPA entities
│           ├── dto/           (30+ files)    # Data transfer objects
│           ├── Enum/          (16 files)     # Application enums
│           ├── security/                     # JWT filter
│           └── util/                         # JWT utilities
│
├── 📁 Front-End/
│   └── HMS_Front/
│       ├── package.json                      # NPM dependencies
│       └── src/
│           ├── App.tsx                       # Main routing (50+ routes)
│           ├── pages/                        # Role-based pages
│           │   ├── admin/      (12 pages)
│           │   ├── doctor/     (8 pages)
│           │   ├── patient/    (6 pages)
│           │   ├── nurse/      (3 pages)
│           │   ├── pharmacist/ (4 pages)
│           │   ├── receptionist/(5 pages)
│           │   ├── accountant/ (4 pages)
│           │   └── technician/ (4 pages)
│           ├── components/                   # Reusable UI components
│           ├── services/      (15+ files)    # API integration
│           ├── contexts/                     # Auth, Data, Theme
│           ├── hooks/                        # Custom React hooks
│           ├── types/                        # TypeScript definitions
│           └── lib/                          # API client, utilities
│
└── 📄 README.md
```

---

## 🚀 API Endpoints Summary

### المصادقة (Auth)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | تسجيل الدخول |
| POST | /api/auth/refresh-token | تجديد التوكن |
| POST | /api/auth/logout | تسجيل الخروج |
| GET | /api/auth/me | بيانات المستخدم الحالي |
| PUT | /api/auth/change-password/{id} | تغيير كلمة المرور |

### المرضى (Patients)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/patients | عرض جميع المرضى |
| POST | /api/patients | تسجيل مريض جديد |
| GET | /api/patients/{id} | بيانات مريض محدد |
| PUT | /api/patients/{id} | تحديث بيانات المريض |
| DELETE | /api/patients/{id} | حذف مريض |

### المواعيد (Appointments)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/appointments | جميع المواعيد |
| POST | /api/appointments | إنشاء موعد |
| PUT | /api/appointments/{id} | تحديث موعد |
| PATCH | /api/appointments/{id}/confirm | تأكيد موعد |
| PATCH | /api/appointments/{id}/complete | إكمال موعد |
| PATCH | /api/appointments/{id}/cancel | إلغاء موعد |

### الأدوية والصيدلة
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT/DELETE | /api/medicine/** | إدارة الأدوية |
| GET/POST/PUT/DELETE | /api/medicine-stock/** | إدارة المخزون |
| GET/POST/PUT/DELETE | /api/medicine-categories/** | تصنيفات الأدوية |
| POST | /api/medicine-dispensations/** | صرف الأدوية |
| GET/POST/PUT/DELETE | /api/prescriptions/** | الوصفات الطبية |

### الفوترة (Billing)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT | /api/invoices/** | إدارة الفواتير |
| POST | /api/invoices/{id}/payments | إضافة دفعة |
| GET | /api/accountants/** | عمليات المحاسبة |

### الفحوصات (Lab Tests)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/PUT | /api/test-requests/** | طلبات الفحوصات |
| PATCH | /api/test-requests/{id}/acknowledge | قبول الطلب |
| PATCH | /api/test-requests/{id}/complete | إكمال الفحص |

---

## ⚙️ تشغيل المشروع | How to Run

### المتطلبات (Prerequisites)
- Java 17+
- Node.js 18+
- MySQL 8.x
- Maven 3.x

### 1️⃣ إعداد قاعدة البيانات
```sql
CREATE DATABASE hms_backend;
```

### 2️⃣ تشغيل الـ Backend
```bash
cd Back-End/Back-End/hospital-management-system-main
./mvnw spring-boot:run
```
> السيرفر يعمل على: http://localhost:8080
> Swagger UI: http://localhost:8080/swagger-ui.html

### 3️⃣ تشغيل الـ Frontend
```bash
cd Front-End/HMS_Front
npm install
npm run dev
```
> التطبيق يعمل على: http://localhost:5173

---

## 📈 إحصائيات المشروع | Project Statistics

| Metric | Value |
|--------|-------|
| إجمالي الصفحات | 46+ صفحة |
| الأدوار | 8 أدوار مستخدم |
| API Endpoints | 80+ endpoint |
| جداول قاعدة البيانات | 20+ جدول |
| Controllers | 18 controller |
| Services | 22 service |
| Frontend Components | 70+ component |
| Routes | 50+ route |
| TypeScript Types | 25+ type/interface |

---

## 🎨 تصميم واجهة المستخدم | UI/UX Design

- **Design System**: shadcn/ui — مبني على Radix UI لدعم الـ Accessibility
- **Responsive Design**: تصميم متجاوب يعمل على جميع الأجهزة
- **Dark/Light Mode**: دعم الوضع الداكن والفاتح
- **Data Visualization**: رسوم بيانية تفاعلية لعرض البيانات
- **Form Validation**: تحقق فوري من البيانات المدخلة مع رسائل خطأ واضحة
- **Toast Notifications**: إشعارات فورية لعمليات النظام
- **Loading States**: حالات تحميل مرئية لتحسين تجربة المستخدم

---

## 🧪 الأنماط المعمارية | Design Patterns

### Backend Patterns
- **Layered Architecture**: Controller → Service → Repository → Entity
- **DTO Pattern**: فصل بيانات العرض عن كيانات قاعدة البيانات
- **Builder Pattern**: بناء الكائنات المعقدة (Lombok @Builder)
- **Repository Pattern**: تجريد طبقة الوصول للبيانات
- **Strategy Pattern**: استراتيجيات مختلفة للمصادقة والتفويض
- **Inheritance Mapping**: JOINED strategy لوراثة الكيانات

### Frontend Patterns
- **Context API**: إدارة الحالة العامة (Auth, Data, Theme)
- **Custom Hooks**: إعادة استخدام المنطق
- **Service Layer**: فصل منطق API عن المكونات
- **Protected Routes**: حماية الصفحات بناءً على الصلاحيات
- **Interceptors**: اعتراض الطلبات لإضافة التوكن وتجديده

---

## 🔮 التطويرات المستقبلية | Future Enhancements

- [ ] إضافة نظام مراسلة فوري (Real-time Chat)
- [ ] دعم إشعارات Push Notifications
- [ ] تقارير PDF قابلة للتنزيل
- [ ] تكامل مع أجهزة IoT الطبية
- [ ] تطبيق موبايل (React Native)
- [ ] نظام حجز مواعيد عبر الإنترنت للمرضى الخارجيين
- [ ] تكامل مع بوابات الدفع الإلكتروني
- [ ] نظام AI لمساعدة التشخيص

---

## 👨‍💻 فريق العمل | Team

> مشروع تخرج — [اسم الجامعة / الكلية]

---

## 📝 الخلاصة | Conclusion

نظام إدارة المستشفيات (HMS) يمثل حلاً تقنياً متكاملاً يغطي جميع جوانب إدارة المستشفى. تم بناؤه بأحدث التقنيات مع مراعاة:

- ✅ **الأمان**: JWT + RBAC + BCrypt
- ✅ **قابلية التوسع**: معمارية طبقات + Spring Boot
- ✅ **سهولة الاستخدام**: واجهة حديثة + 8 لوحات تحكم مخصصة
- ✅ **الشمولية**: تغطية جميع أقسام المستشفى
- ✅ **جودة الكود**: TypeScript + Design Patterns + Clean Architecture

---

*تم بناء هذا المشروع بـ ❤️ كمشروع تخرج*


---

# 🏗️ Enterprise DevOps Repository Structure

This repository is organized for enterprise-grade containerization and future
deployment. The application source code is unchanged; the directories below are
the **DevOps foundation** (preparation phase — nothing is built or deployed yet).

```
HMS_last_v/
├── backend/                 # Backend container build (Spring Boot, Java 17)
│   ├── Dockerfile           #   multi-stage build → slim non-root JRE image
│   ├── .dockerignore
│   └── README.md
│
├── frontend/                # Frontend container build (React + Vite)
│   ├── Dockerfile           #   Node build → Nginx runtime
│   ├── .dockerignore
│   ├── nginx/               #   SPA-aware Nginx config (gzip, caching, headers)
│   │   ├── nginx.conf
│   │   └── default.conf
│   └── README.md
│
├── docker/                  # Compose orchestration
│   ├── docker-compose.dev.yml   #  frontend + backend + mysql
│   ├── docker-compose.prod.yml  #  frontend + backend (external database)
│   ├── .env.example             #  placeholders only — no secrets
│   └── README.md
│
├── infrastructure/          # IaC scaffolding (empty placeholders)
│   ├── terraform/  ├── kubernetes/  ├── helm/  ├── ansible/
│   └── README.md
│
├── monitoring/              # Observability scaffolding (empty placeholders)
│   ├── prometheus/  ├── grafana/  ├── loki/
│   └── README.md
│
├── scripts/                 # Automation entrypoints (placeholder no-ops)
│   ├── build.sh  ├── deploy.sh  ├── start.sh  ├── stop.sh
│   └── README.md
│
├── docs/                    # Project & deployment documentation
│   ├── README.md
│   └── deployment/README.md
│
├── .github/workflows/       # CI/CD location (folder only — no pipelines yet)
├── .editorconfig            # Consistent coding styles across editors
├── .gitignore               # Monorepo ignore rules
│
├── Back-End/                # Spring Boot application source (UNCHANGED)
└── Front-End/               # React/Vite application source (UNCHANGED)
```

## Phase status

🚧 **Preparation phase only.** No images are built, no infrastructure is
provisioned, no CI/CD pipelines exist, and nothing is deployed. Each top-level
DevOps folder contains its own `README.md` describing its purpose and future
contents.

## Notes

- **Two sets of start/stop scripts:** the **project-root** `start.sh` / `stop.sh`
  run the app directly (Maven + Vite) for local development and are functional.
  The `scripts/` versions are future Docker-based entrypoints and are placeholders.
- **No hardcoded backend URL:** the Nginx reverse-proxy block uses environment
  placeholders and stays commented out until the deployment phase.
- **Production database is external:** `docker-compose.prod.yml` intentionally has
  no `db` service.
