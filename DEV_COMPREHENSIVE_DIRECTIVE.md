# 📋 توجيه شامل للمطور - معالجة ESLint بلا "حذف سريع"

> **عنوان PR المطلوب:**  
> `feat(lint): zero-warnings refactor – imports & props usage`

---

## 1️⃣ تحليل أوّلي قبل أي شغل

### الخطوات الإلزامية:

1. **شغّل الفحص الشامل:**
   ```bash
   npm run lint -- --format json > lint-report.json
   npx tsc --noEmit > tsc-errors.txt
   npm test -- --run > test-results.txt
   ```

2. **افتح `lint-report.json` وصنّف التحذيرات:**
   - **UI Props** (`checked`, `value`, `onChange` parameters)
   - **Store actions / params** (`credentials`, `phoneData`, destructuring)
   - **Service imports** (`UserListResponse`, type imports)
   - **Overloads / util-libs** (TypeScript overloads، function signatures)

3. **دوّن جدول شامل في `LINT_REVIEW.md`:**

   | الملف | السطر | نوع التحذير | السبب | خطة الإصلاح | حالة |
   |-------|-------|-------------|-------|-------------|------|
   | `checkbox.tsx` | 17 | no-unused-vars | `checked` parameter | ربط بـ JSX input | ⏳ |
   | `data.store.ts` | 16 | no-unused-vars | `UserListResponse` | استخدام في interface extends | ✅ |

> **النتيجة المتوقعة:** مستند `LINT_REVIEW.md` مكتمل قبل بداية أي كود.

---

## 2️⃣ قواعد العمل الثابتة

| القاعدة | لازم يصير | ممنوع |
|---------|-----------|--------|
| **Import** | كل import مُستخدم فعلاً أو مذكور TODO بجانب السطر | ❌ لا تحذف بلا توثيق |
| **متغيّر غير مستخدم** | سبق الاسم بـ `_` أو علّق TODO بجانب السطر | ❌ لا تتركه يطلّع تحذير |
| **Props / Params** | استعملها في JSX أو اللوجك أو انقلها لـ `interface` واضحة | ❌ لا تستخدم `eslint-disable` إلا مع سبب |
| **أنواع مشتركة** | استيرادها من `@depth-studio/types` أو من الـ service | ❌ لا تكرّر نفس الحقول يدوياً |
| **اختبارات** | أي منطق/دالة جديدة → لازم test واحد على الأقل | - |

---

## 3️⃣ خطوات التنفيذ (بدون استعجال)

### المرحلة الأولى: إعادة ترتيب ESLint

✅ **تم إنجازها** - `eslint.config.mjs` معدل بقواعد صارمة:
```js
'no-unused-vars': ['error', { args: 'after-used', ignoreRestSiblings: false }],
'@typescript-eslint/no-unused-vars': ['error'],
```

### المرحلة الثانية: UI Components

**للمكونات التالية:** `checkbox.tsx`, `radio.tsx`, `select.tsx`, `datepicker.tsx`, `file-upload.tsx`

#### مثال تطبيقي - `CheckboxGroup`:
```tsx
// ❌ قبل - parameter غير مستخدم
interface CheckboxGroupProps {
  values: string[]; // محذَّر عليه
  onChange: (values: string[]) => void;
}

// ✅ بعد - ربط فعلي
const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ values, onChange, options }) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    const newValues = checked 
      ? [...values, optionValue]
      : values.filter(v => v !== optionValue);
    onChange(newValues);
  };

  return (
    <div>
      {options.map(option => (
        <input
          key={option.value}
          checked={values.includes(option.value)} // استخدام values
          onChange={(e) => handleChange(option.value, e.target.checked)}
        />
      ))}
    </div>
  );
};
```

### المرحلة الثالثة: Store Files

#### `data.store.ts` - **الأولوية العالية**

✅ **تم إنجازها جزئياً** - استخدام `UserListResponse`:

```ts
// ✅ رجع الاستيراد
import { UserListResponse } from '../services/user.service';

// ✅ استخدام extends بدل تكرار
interface UsersListState extends UserListResponse {
  limit: number;
  isLoading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

// ✅ استخدام spread بدل destructuring
set({
  ...response.data!, // type-safe
  limit,
  isLoading: false
});
```

#### `auth.store.ts` - **معالجة Parameters**

```ts
// المطلوب: ربط parameters بـ AuthService
signInWithEmail: async (credentials: EmailLoginData) => {
  // ✅ استخدام فعلي
  console.log('🔐 محاولة دخول:', credentials.email);
  const result = await authService.signInWithEmail(credentials);
  // ... باقي المنطق
},
```

#### `ui.store.ts` - **Zustand Patterns**

```ts
// ✅ للـ destructuring في hooks - نمط صحيح
export const useThemeAndLanguage = () => {
  // هذه ليست مشكلة - Zustand pattern معروف
  const { theme, language, setTheme } = useUIStore();
  return { theme, language, setTheme };
};
```

### المرحلة الرابعة: Services / Utils

#### `messaging.ts`
```ts
// ✅ إعادة تسمية parameter غير مستخدم
onMessageReceived(_messagePayload: MessagePayload): () => void {
  // أو TODO comment إذا راح نستخدمه لاحقاً
}
```

### المرحلة الخامسة: اختبارات

**اختبارات مطلوبة:**

1. **UserListResponse usage test:**
```ts
test('should use UserListResponse correctly', async () => {
  const mockResponse: UserListResponse = {
    users: [mockUser],
    total: 1,
    page: 1,
    totalPages: 1
  };
  
  // تأكد من أن UsersListState ترث من UserListResponse
  expect(store.getState().usersList.totalPages).toBeDefined();
});
```

2. **UI Components props usage:**
```ts
test('CheckboxGroup uses values prop', () => {
  const values = ['option1'];
  const { getByRole } = render(
    <CheckboxGroup values={values} onChange={jest.fn()} options={mockOptions} />
  );
  
  expect(getByRole('checkbox')).toBeChecked();
});
```

---

## 4️⃣ معايير القبول الصارمة

### ✅ Checklist إلزامي:

- [ ] **0 تحذير ESLint** (ليس فقط Errors)
- [ ] **0 Error TypeScript** (`npx tsc --noEmit`)
- [ ] **كل الاستيرادات واضحة الاستخدام** أو موثّقة بـ TODO + رقم تذكرة
- [ ] **لا يوجد `eslint-disable` بلا تعليق سبب مفصل**
- [ ] **اختبارات مضافة/محدّثة** لإنعكاس التغييرات
- [ ] **ملف `LINT_REVIEW.md`** يلخّص التحذيرات وكيف انحلّت
- [ ] **جميع الاختبارات تمر** (`npm test -- --run`)

### 🔍 مراجعة نهائية:

```bash
# يجب أن تكون النتيجة صفر في كل منها
npm run lint          # 0 warnings, 0 errors
npx tsc --noEmit      # 0 errors  
npm test -- --run     # All tests pass
npm run build         # Successful build
```

---

## 5️⃣ إدارة الوقت والتنظيم

### 📅 خطة العمل المقترحة:

**اليوم الأول:**
- تحليل أولي + إنشاء `LINT_REVIEW.md`
- معالجة UI Components (2-3 ملفات)

**اليوم الثاني:**  
- معالجة Store files
- اختبارات أساسية

**اليوم الثالث:**
- Services/Utils + مراجعة نهائية
- PR submission

### 🎯 نصائح العمل:

1. **اشتغل على دفعات صغيرة** (UI → Stores → Services)
2. **بعد كل دفعة شغّل:** `npm run lint && npx tsc --noEmit`
3. **commit صغيرة ومتكررة** مع messages واضحة
4. **لا تجمع كل التغييرات بدفعة واحدة**

---

## 📋 مثال LINT_REVIEW.md المطلوب

```markdown
# 🔍 مراجعة شاملة لتحذيرات ESLint

## الوضع الأولي:
- إجمالي التحذيرات: 45
- إجمالي الأخطاء: 0

## التصنيف:
- UI Components: 25 تحذير
- Store files: 15 تحذير  
- Services: 5 تحذيرات

## المعالجة:
| الملف | التحذير | الحل | الحالة |
|-------|---------|------|-------|
| checkbox.tsx | unused 'checked' | ربط بـ JSX | ✅ |
| data.store.ts | unused 'UserListResponse' | extends interface | ✅ |

## النتيجة النهائية:
- ✅ 0 تحذيرات
- ✅ 0 أخطاء
- ✅ جميع الاختبارات تمر
```

---

## 💪 رسالة ختامية

**هذا المشروع الآن محمي من:**
- ❌ حذف استيرادات مهمة بالخطأ
- ❌ تكرار تعريفات الأنواع  
- ❌ مشاكل type safety
- ❌ "الحلول السريعة" غير المدروسة

**اتبع هذا التوجيه بدقة، ولا ترفع PR إلا بعد تحقيق جميع معايير القبول.** 

**النتيجة: كود احترافي، قوي، قابل للصيانة!** 🚀 