# 📋 جزء 5: المرحلة الخامسة - نظام إدارة المهام المتقدم

## 📅 المرحلة الخامسة: نظام إدارة المهام المتقدم (الأسبوع 5-6)

> **🎯 الهدف:** بناء نظام إدارة مهام شامل يدعم إنشاء، تخصيص، متابعة، وتقييم المهام مع دعم AI لتوزيع المهام الذكي والجدولة التلقائية.

### 🔗 إعداد Repository Pattern للمهام

#### **المهمة #104**
- [ ] **إنشاء Task Repository Interface**
  - **نوع الملف:** `Dart Abstract Class`
  - **اسم الملف:** `task_repository_interface.dart`
  - **المسار:** `lib/features/tasks/domain/repositories/task_repository_interface.dart`
  - **المحتوى:** واجهة Repository للمهام - تحدد جميع العمليات المطلوبة لإدارة المهام
  - **الشرح بالعراقي:** هاي الواجهة راح تحدد كل العمليات اللي نحتاجها لإدارة المهام - إنشاء مهمة، تحديث، حذف، جلب المهام، وتغيير الحالة.
  - **ليش هذا التسلسل:** لأن Repository Interface أساس Clean Architecture للمهام - لازم يجي أول شي قبل Implementation
  - **الارتباطات:**
    - يرتبط بـ: `task_entity.dart` (من المرحلة الثالثة)، جميع Task Use Cases
    - يؤثر على: جميع عمليات إدارة المهام
    - مطلوب لـ: Task Repository Implementation، جميع Task Use Cases
  - **مكونات UI/UX:** يدعم جميع عمليات المهام في الواجهة
  - **الاختبار:** تنفيذ interface في Repository Implementation

#### **المهمة #105**
- [ ] **إنشاء Task Remote DataSource**
  - **نوع الملف:** `Dart DataSource Class`
  - **اسم الملف:** `task_remote_datasource.dart`
  - **المسار:** `lib/features/tasks/data/datasources/task_remote_datasource.dart`
  - **المحتوى:** التعامل المباشر مع Firebase Firestore للمهام - CRUD operations مع Real-time updates
  - **الشرح بالعراقي:** هاي الطبقة راح تتعامل مباشرة مع Firebase لحفظ وجلب المهام. راح تدعم التحديثات الفورية حتى لو أكثر من شخص يشتغل على نفس المهمة.
  - **ليش هذا التسلسل:** لأن DataSource يحتاج Firebase Service والنماذج تكون جاهزة من المراحل السابقة
  - **الارتباطات:**
    - يرتبط بـ: `firebase_service.dart`، `task_model.dart` (من المرحلة الثالثة)
    - يؤثر على: حفظ وجلب المهام من الخادم
    - مطلوب لـ: Real-time task updates، مزامنة البيانات
  - **مكونات UI/UX:** Real-time updates في قوائم المهام
  - **الاختبار:** إنشاء وجلب مهمة من Firebase

#### **المهمة #106**
- [ ] **إنشاء Task Local DataSource**
  - **نوع الملف:** `Dart DataSource Class`
  - **اسم الملف:** `task_local_datasource.dart`
  - **المسار:** `lib/features/tasks/data/datasources/task_local_datasource.dart`
  - **المحتوى:** إدارة cache المهام محلياً مع دعم Offline functionality
  - **الشرح بالعراقي:** هاي الطبقة راح تحفظ المهام محلياً على الجهاز. حتى لو انقطع النت، المستخدم يقدر يشوف المهام ويعدل عليها، وتترفع لما يرجع النت.
  - **ليش هذا التسلسل:** لأن Local DataSource يعتمد على Storage Service من المرحلة الأولى
  - **الارتباطات:**
    - يرتبط بـ: `storage_service.dart` (من المرحلة الأولى)، `task_model.dart`
    - يؤثر على: الأداء وتجربة Offline
    - مطلوب لـ: Cache، Offline support، تسريع التطبيق
  - **مكونات UI/UX:** مؤشرات Offline/Online، cache للأداء
  - **الاختبار:** حفظ مهام محلياً والوصول إليها بدون نت

#### **المهمة #107**
- [ ] **إنشاء Task Repository Implementation**
  - **نوع الملف:** `Dart Repository Class`
  - **اسم الملف:** `task_repository.dart`
  - **المسار:** `lib/features/tasks/data/repositories/task_repository.dart`
  - **المحتوى:** تنفيذ Repository الفعلي - يربط بين DataSources ويدير الـ caching والـ synchronization
  - **الشرح بالعراقي:** هاي الطبقة راح تربط بين التخزين المحلي والخادم. راح تقرر متى تجلب البيانات من النت ومتى من الكاش، وكيف تتعامل مع التعارضات.
  - **ليش هذا التسلسل:** لأن Repository Implementation يحتاج Interface والDataSources تكون جاهزة
  - **الارتباطات:**
    - يرتبط بـ: `task_repository_interface.dart`، `task_remote_datasource.dart`، `task_local_datasource.dart`
    - يؤثر على: استراتيجية إدارة البيانات
    - مطلوب لـ: ربط Use Cases مع طبقة البيانات
  - **مكونات UI/UX:** يحسن الأداء وموثوقية البيانات
  - **الاختبار:** إنشاء مهمة وتزامنها بين المحلي والخادم

### 🎯 إنشاء Use Cases لإدارة المهام

#### **المهمة #108**
- [ ] **إنشاء Create Task Use Case**
  - **نوع الملف:** `Dart Use Case Class`
  - **اسم الملف:** `create_task_usecase.dart`
  - **المسار:** `lib/features/tasks/domain/usecases/create_task_usecase.dart`
  - **المحتوى:** منطق إنشاء مهمة جديدة مع validation وتخصيص تلقائي للمصور المناسب
  - **الشرح بالعراقي:** هاي Use Case راح تتولى إنشاء مهام جديدة. راح تتحقق من صحة البيانات وتختار أفضل مصور للمهمة حسب التخصص والجدولة.
  - **ليش هذا التسلسل:** لأن Create Task يعتمد على Repository Interface، فلازم يجي بعده
  - **الارتباطات:**
    - يرتبط بـ: `task_repository_interface.dart`، `task_entity.dart`، `ai_assignment_usecase.dart`
    - يؤثر على: إنشاء المهام الجديدة
    - مطلوب لـ: Task Controller، Create Task Screen
  - **مكونات UI/UX:** فورم إنشاء مهمة، اختيار المصور، جدولة
  - **الاختبار:** إنشاء مهمة وتخصيصها لمصور

#### **المهمة #109**
- [ ] **إنشاء Update Task Use Case**
  - **نوع الملف:** `Dart Use Case Class`
  - **اسم الملف:** `update_task_usecase.dart`
  - **المسار:** `lib/features/tasks/domain/usecases/update_task_usecase.dart`
  - **المحتوى:** منطق تحديث بيانات المهمة مع تتبع التغييرات والإشعارات
  - **الشرح بالعراقي:** هاي Use Case راح تتولى تحديث المهام الموجودة. راح تسجل كل التغييرات وترسل إشعارات للمعنيين لما يصير تحديث مهم.
  - **ليش هذا التسلسل:** لأن Update Task يستخدم نفس Repository، فيمكن إنشاؤه مع Create Task
  - **الارتباطات:**
    - يرتبط بـ: `task_repository_interface.dart`، `notification_service.dart`
    - يؤثر على: تحديث المهام الموجودة
    - مطلوب لـ: Task Controller، Edit Task Screen
  - **مكونات UI/UX:** فورم تحديث، تتبع التغييرات، إشعارات
  - **الاختبار:** تحديث مهمة ومراقبة الإشعارات

#### **المهمة #110**
- [ ] **إنشاء Get Tasks Use Case**
  - **نوع الملف:** `Dart Use Case Class`
  - **اسم الملف:** `get_tasks_usecase.dart`
  - **المسار:** `lib/features/tasks/domain/usecases/get_tasks_usecase.dart`
  - **المحتوى:** منطق جلب المهام مع فلترة وترتيب متقدم حسب الدور والبراند
  - **الشرح بالعراقي:** هاي Use Case راح تجلب المهام حسب دور المستخدم. علي يشوف كل شي، حسن يشوف مشاريعه، والمصورين يشوفون مهامهم الخاصة.
  - **ليش هذا التسلسل:** لأن Get Tasks يحتاج Repository ونماذج المهام تكون جاهزة
  - **الارتباطات:**
    - يرتبط بـ: `task_repository_interface.dart`، `user_role_model.dart`، `brand_model.dart`
    - يؤثر على: عرض قوائم المهام
    - مطلوب لـ: Task Controller، Task List Screen
  - **مكونات UI/UX:** قوائم المهام المفلترة، بحث، ترتيب
  - **الاختبار:** جلب مهام مختلفة حسب الدور

#### **المهمة #111**
- [ ] **إنشاء Change Task Status Use Case**
  - **نوع الملف:** `Dart Use Case Class`
  - **اسم الملف:** `change_task_status_usecase.dart`
  - **المسار:** `lib/features/tasks/domain/usecases/change_task_status_usecase.dart`
  - **المحتوى:** منطق تغيير حالة المهمة مع validation للصلاحيات وتحديث Timeline
  - **الشرح بالعراقي:** هاي Use Case راح تغير حالة المهمة - من جديدة لقيد التنفيذ لمكتملة. راح تتحقق من الصلاحيات وتحدث التايم لاين.
  - **ليش هذا التسلسل:** لأن تغيير الحالة يعتمد على Get Tasks والتحديث، فلازم يجي بعدهم
  - **الارتباطات:**
    - يرتبط بـ: `task_repository_interface.dart`، `task_status_model.dart`، `timeline_model.dart`
    - يؤثر على: workflow المهام
    - مطلوب لـ: Task Controller، Task Detail Screen
  - **مكونات UI/UX:** أزرار تغيير الحالة، timeline، progress indicators
  - **الاختبار:** تغيير حالة مهمة ومراقبة Timeline

#### **المهمة #112**
- [ ] **إنشاء Assign Task Use Case**
  - **نوع الملف:** `Dart Use Case Class`
  - **اسم الملف:** `assign_task_usecase.dart`
  - **المسار:** `lib/features/tasks/domain/usecases/assign_task_usecase.dart`
  - **المحتوى:** منطق تخصيص المهام للمصورين مع تحقق من الجدولة والتخصص
  - **الشرح بالعراقي:** هاي Use Case راح تخصص المهام للمصورين. راح تتحقق من جدولة المصور وتخصصه قبل ما تخصص له المهمة.
  - **ليش هذا التسلسل:** لأن تخصيص المهام يحتاج Create Task وUser Management تكون جاهزة
  - **الارتباطات:**
    - يرتبط بـ: `task_repository_interface.dart`، `user_model.dart`، `calendar_service.dart`
    - يؤثر على: توزيع المهام على الفريق
    - مطلوب لـ: Task Controller، Assignment Screen
  - **مكونات UI/UX:** قائمة المصورين، جدولة، تخصصات
  - **الاختبار:** تخصيص مهمة لمصور متاح

#### **المهمة #113**
- [ ] **إنشاء Delete Task Use Case**
  - **نوع الملف:** `Dart Use Case Class`
  - **اسم الملف:** `delete_task_usecase.dart`
  - **المسار:** `lib/features/tasks/domain/usecases/delete_task_usecase.dart`
  - **المحتوى:** منطق حذف المهام مع حماية البيانات والتحقق من الصلاحيات
  - **الشرح بالعراقي:** هاي Use Case راح تحذف المهام بأمان. راح تتحقق من الصلاحيات وتحذر من المهام المهمة قبل الحذف.
  - **ليش هذا التسلسل:** لأن Delete Task يحتاج جميع العمليات الأخرى تكون مفهومة ومطبقة
  - **الارتباطات:**
    - يرتبط بـ: `task_repository_interface.dart`، `user_role_model.dart`
    - يؤثر على: حذف المهام
    - مطلوب لـ: Task Controller، Task Management Screen
  - **مكونات UI/UX:** تأكيد الحذف، رسائل تحذير، soft delete
  - **الاختبار:** حذف مهمة مع التحقق من الصلاحيات

### 🎮 إنشاء Task Controllers

#### **المهمة #114**
- [ ] **إنشاء Task Controller**
  - **نوع الملف:** `Dart Controller Class`
  - **اسم الملف:** `task_controller.dart`
  - **المسار:** `lib/features/tasks/presentation/controllers/task_controller.dart`
  - **المحتوى:** Controller رئيسي لإدارة حالة المهام - يدير CRUD operations وReal-time updates
  - **الشرح بالعراقي:** هاي Controller الرئيسي للمهام. راح يدير كل العمليات - إنشاء، تحديث، حذف، وجلب المهام مع تحديثات فورية.
  - **ليش هذا التسلسل:** لأن Controller يحتاج جميع Use Cases تكون جاهزة قبل ما يستخدمها
  - **الارتباطات:**
    - يرتبط بـ: جميع Task Use Cases، `base_controller.dart` (من المرحلة الأولى)
    - يؤثر على: جميع واجهات المهام
    - مطلوب لـ: Task Screens، Task Widgets
  - **مكونات UI/UX:** إدارة حالة المهام، loading states، error handling
  - **الاختبار:** إنشاء وإدارة مهام من Controller

#### **المهمة #115**
- [ ] **إنشاء Task List Controller**
  - **نوع الملف:** `Dart Controller Class`
  - **اسم الملف:** `task_list_controller.dart`
  - **المسار:** `lib/features/tasks/presentation/controllers/task_list_controller.dart`
  - **المحتوى:** Controller مخصص لقوائم المهام مع فلترة، بحث، وتجميع
  - **الشرح بالعراقي:** هاي Controller مخصص لإدارة قوائم المهام. راح يتعامل مع البحث، الفلترة، والترتيب بطريقة ذكية وسريعة.
  - **ليش هذا التسلسل:** لأن Task List Controller يعتمد على Task Controller الأساسي
  - **الارتباطات:**
    - يرتبط بـ: `task_controller.dart`، `get_tasks_usecase.dart`
    - يؤثر على: Task List Screen، Task Dashboard
    - مطلوب لـ: قوائم المهام، البحث والفلترة
  - **مكونات UI/UX:** بحث، فلاتر، ترتيب، تجميع المهام
  - **الاختبار:** بحث وفلترة المهام

#### **المهمة #116**
- [ ] **إنشاء Task Calendar Controller**
  - **نوع الملف:** `Dart Controller Class`
  - **اسم الملف:** `task_calendar_controller.dart`
  - **المسار:** `lib/features/tasks/presentation/controllers/task_calendar_controller.dart`
  - **المحتوى:** Controller لعرض المهام في تقويم مع إدارة الجدولة والمواعيد
  - **الشرح بالعراقي:** هاي Controller راح يعرض المهام بشكل تقويم. راح يساعد بالجدولة ومعرفة المواعيد المهمة والتعارضات.
  - **ليش هذا التسلسل:** لأن Calendar Controller يحتاج Task Controller ونماذج التقويم
  - **الارتباطات:**
    - يرتبط بـ: `task_controller.dart`، `calendar_event_model.dart` (من المرحلة الثالثة)
    - يؤثر على: Task Calendar Screen، جدولة المهام
    - مطلوب لـ: عرض تقويم المهام، إدارة المواعيد
  - **مكونات UI/UX:** تقويم تفاعلي، عرض المهام اليومية، الأسبوعية، الشهرية
  - **الاختبار:** عرض مهام في التقويم وجدولة مهمة جديدة

### 🎨 إنشاء Task Widgets المخصصة

#### **المهمة #117**
- [ ] **إنشاء Task Card Widget**
  - **نوع الملف:** `Dart Widget Class`
  - **اسم الملف:** `task_card.dart`
  - **المسار:** `lib/features/tasks/presentation/widgets/task_card.dart`
  - **المحتوى:** بطاقة مهمة جميلة مع جميع المعلومات الأساسية وألوان البراند
  - **الشرح بالعراقي:** هاي بطاقة المهمة اللي راح تظهر بالقوائم. راح تعرض كل المعلومات المهمة بشكل جميل مع ألوان البراند المختار.
  - **ليش هذا التسلسل:** لأن Task Card يحتاج المكونات الأساسية والألوان من المراحل السابقة
  - **الارتباطات:**
    - يرتبط بـ: `task_model.dart`، `app_colors.dart` (من المرحلة الأولى)، `custom_button.dart`
    - يؤثر على: عرض المهام في القوائم
    - مطلوب لـ: Task List Screen، Task Dashboard
  - **مكونات UI/UX:** بطاقة جميلة، صورة المهمة، معلومات المصور، حالة المهمة
  - **الاختبار:** عرض بطاقات مهام مختلفة

#### **المهمة #118**
- [ ] **إنشاء Task Status Widget**
  - **نوع الملف:** `Dart Widget Class`
  - **اسم الملف:** `task_status_widget.dart`
  - **المسار:** `lib/features/tasks/presentation/widgets/task_status_widget.dart`
  - **المحتوى:** مكون حالة المهمة مع ألوان مختلفة وإمكانية تغيير الحالة
  - **الشرح بالعراقي:** هاي المكون راح يعرض حالة المهمة بألوان مختلفة - أحمر للجديدة، أصفر لقيد التنفيذ، أخضر للمكتملة.
  - **ليش هذا التسلسل:** لأن Status Widget يحتاج Task Models ونظام الألوان يكون جاهز
  - **الارتباطات:**
    - يرتبط بـ: `task_status_model.dart`، `app_colors.dart`، `change_task_status_usecase.dart`
    - يؤثر على: عرض وتغيير حالة المهام
    - مطلوب لـ: Task Card، Task Detail Screen
  - **مكونات UI/UX:** شارات ملونة، أزرار تغيير الحالة، animations
  - **الاختبار:** عرض حالات مختلفة وتغييرها

#### **المهمة #119**
- [ ] **إنشاء Task Priority Widget**
  - **نوع الملف:** `Dart Widget Class`
  - **اسم الملف:** `task_priority_widget.dart`
  - **المسار:** `lib/features/tasks/presentation/widgets/task_priority_widget.dart`
  - **المحتوى:** مكون أولوية المهمة مع مؤشرات بصرية واضحة
  - **الشرح بالعراقي:** هاي المكون راح يعرض أولوية المهمة - عاجل، مهم، عادي. كل واحدة بلون ورمز مختلف حتى المستخدم يعرف أيش الأهم.
  - **ليش هذا التسلسل:** لأن Priority Widget يعتمد على نماذج الأولوية ونظام الألوان
  - **الارتباطات:**
    - يرتبط بـ: `task_priority_model.dart`، `app_colors.dart`
    - يؤثر على: ترتيب وعرض المهام حسب الأولوية
    - مطلوب لـ: Task Card، Task Form
  - **مكونات UI/UX:** أيقونات الأولوية، ألوان مميزة، ترتيب بصري
  - **الاختبار:** عرض مهام بأولويات مختلفة

#### **المهمة #120**
- [ ] **إنشاء Task Form Widget**
  - **نوع الملف:** `Dart Widget Class`
  - **اسم الملف:** `task_form.dart`
  - **المسار:** `lib/features/tasks/presentation/widgets/task_form.dart`
  - **المحتوى:** فورم إنشاء/تحديث المهام مع جميع الحقول المطلوبة وvalidation
  - **الشرح بالعراقي:** هاي الفورم راح يستخدم لإنشاء وتحديث المهام. راح يحتوي على كل الحقول المطلوبة مع تحقق من صحة البيانات.
  - **ليش هذا التسلسل:** لأن Task Form يحتاج جميع المكونات الفرعية تكون جاهزة
  - **الارتباطات:**
    - يرتبط بـ: `task_status_widget.dart`، `task_priority_widget.dart`، `auth_text_field.dart` (من المرحلة الثانية)
    - يؤثر على: إنشاء وتحديث المهام
    - مطلوب لـ: Create Task Screen، Edit Task Screen
  - **مكونات UI/UX:** فورم شامل، validation، date picker، dropdown للبراندات
  - **الاختبار:** إنشاء مهمة جديدة من الفورم

#### **المهمة #121**
- [ ] **إنشاء Task Timeline Widget**
  - **نوع الملف:** `Dart Widget Class`
  - **اسم الملف:** `task_timeline.dart`
  - **المسار:** `lib/features/tasks/presentation/widgets/task_timeline.dart`
  - **المحتوى:** مكون timeline للمهمة يعرض تاريخ الأحداث والتطورات
  - **الشرح بالعراقي:** هاي المكون راح يعرض تاريخ المهمة - متى انشأت، متى تحدثت، متى اكتملت. مثل story للمهمة.
  - **ليش هذا التسلسل:** لأن Timeline يحتاج نماذج الأحداث ومكونات التاريخ
  - **الارتباطات:**
    - يرتبط بـ: `timeline_model.dart`، `date_extension.dart` (من المرحلة الأولى)
    - يؤثر على: تتبع تطور المهام
    - مطلوب لـ: Task Detail Screen، تاريخ المهام
  - **مكونات UI/UX:** خط زمني جميل، أيقونات الأحداث، تواريخ واضحة
  - **الاختبار:** عرض timeline لمهمة مع عدة أحداث

#### **المهمة #122**
- [ ] **إنشاء Kanban Board Widget**
  - **نوع الملف:** `Dart Widget Class`
  - **اسم الملف:** `kanban_board.dart`
  - **المسار:** `lib/features/tasks/presentation/widgets/kanban_board.dart`
  - **المحتوى:** لوحة Kanban للمهام مع drag & drop وعرض الأعمدة
  - **الشرح بالعراقي:** هاي لوحة Kanban راح تعرض المهام بشكل أعمدة - جديدة، قيد التنفيذ، مكتملة. مع إمكانية سحب وإفلات المهام.
  - **ليش هذا التسلسل:** لأن Kanban Board يحتاج Task Card وTask Status تكون جاهزة
  - **الارتباطات:**
    - يرتبط بـ: `task_card.dart`، `task_status_widget.dart`، `change_task_status_usecase.dart`
    - يؤثر على: إدارة workflow المهام
    - مطلوب لـ: Task Kanban Screen، إدارة المشاريع
  - **مكونات UI/UX:** أعمدة الحالات، drag & drop، مؤشرات التقدم
  - **الاختبار:** سحب وإفلات مهمة من عمود لآخر

### 📱 إنشاء Task Screens

#### **المهمة #123**
- [ ] **إنشاء Task List Screen**
  - **نوع الملف:** `Dart Screen Class`
  - **اسم الملف:** `task_list_screen.dart`
  - **المسار:** `lib/features/tasks/presentation/screens/task_list_screen.dart`
  - **المحتوى:** شاشة قائمة المهام مع بحث، فلترة، وترتيب متقدم
  - **الشرح بالعراقي:** هاي الشاشة الرئيسية للمهام. راح تعرض كل مهام المستخدم مع إمكانية البحث والفلترة حسب الحالة، البراند، والأولوية.
  - **ليش هذا التسلسل:** لأن Task List Screen يحتاج جميع المكونات والControllers تكون جاهزة
  - **الارتباطات:**
    - يرتبط بـ: `task_list_controller.dart`، `task_card.dart`، `task_status_widget.dart`
    - يؤثر على: تجربة المستخدم الأساسية مع المهام
    - مطلوب لـ: التنقل الرئيسي، إدارة المهام
  - **مكونات UI/UX:** قائمة المهام، بحث، فلاتر، floating action button للإضافة
  - **الاختبار:** عرض قائمة المهام والبحث فيها

#### **المهمة #124**
- [ ] **إنشاء Task Detail Screen**
  - **نوع الملف:** `Dart Screen Class`
  - **اسم الملف:** `task_detail_screen.dart`
  - **المسار:** `lib/features/tasks/presentation/screens/task_detail_screen.dart`
  - **المحتوى:** شاشة تفاصيل المهمة مع جميع المعلومات والإجراءات المتاحة
  - **الشرح بالعراقي:** هاي شاشة تفاصيل المهمة الكاملة. راح تعرض كل المعلومات، التايم لاين، والإجراءات المتاحة حسب دور المستخدم.
  - **ليش هذا التسلسل:** لأن Detail Screen يحتاج جميع المكونات التفصيلية
  - **الارتباطات:**
    - يرتبط بـ: `task_controller.dart`، `task_timeline.dart`، `task_status_widget.dart`
    - يؤثر على: إدارة تفاصيل المهام
    - مطلوب لـ: عرض وتحديث تفاصيل المهمة
  - **مكونات UI/UX:** تفاصيل شاملة، timeline، أزرار الإجراءات، صور المهمة
  - **الاختبار:** عرض تفاصيل مهمة وتحديثها

#### **المهمة #125**
- [ ] **إنشاء Create Task Screen**
  - **نوع الملف:** `Dart Screen Class`
  - **اسم الملف:** `create_task_screen.dart`
  - **المسار:** `lib/features/tasks/presentation/screens/create_task_screen.dart`
  - **المحتوى:** شاشة إنشاء مهمة جديدة مع فورم شامل وخيارات متقدمة
  - **الشرح بالعراقي:** هاي شاشة إنشاء مهام جديدة. راح تسمح للمديرين بإنشاء مهام مفصلة مع تحديد البراند، الأولوية، والمصور المطلوب.
  - **ليش هذا التسلسل:** لأن Create Task Screen يحتاج Task Form وجميع المكونات المساعدة
  - **الارتباطات:**
    - يرتبط بـ: `task_controller.dart`، `task_form.dart`، `create_task_usecase.dart`
    - يؤثر على: إنشاء مهام جديدة
    - مطلوب لـ: إضافة مهام للنظام
  - **مكونات UI/UX:** فورم إنشاء، اختيار البراند، تحديد المصور، جدولة
  - **الاختبار:** إنشاء مهمة جديدة مع جميع التفاصيل

#### **المهمة #126**
- [ ] **إنشاء Task Calendar Screen**
  - **نوع الملف:** `Dart Screen Class`
  - **اسم الملف:** `task_calendar_screen.dart`
  - **المسار:** `lib/features/tasks/presentation/screens/task_calendar_screen.dart`
  - **المحتوى:** شاشة تقويم المهام مع عرض يومي، أسبوعي، وشهري
  - **الشرح بالعراقي:** هاي شاشة التقويم للمهام. راح تعرض المهام مجدولة بالتقويم مع إمكانية التنقل بين الأيام والأسابيع والشهور.
  - **ليش هذا التسلسل:** لأن Calendar Screen يحتاج Calendar Controller ومكونات التقويم
  - **الارتباطات:**
    - يرتبط بـ: `task_calendar_controller.dart`، `task_card.dart`
    - يؤثر على: جدولة المهام وإدارة المواعيد
    - مطلوب لـ: عرض تقويم المهام
  - **مكونات UI/UX:** تقويم تفاعلي، عرض المهام اليومية، drag & drop للجدولة
  - **الاختبار:** عرض مهام في التقويم وإعادة جدولتها

#### **المهمة #127**
- [ ] **إنشاء Kanban Board Screen**
  - **نوع الملف:** `Dart Screen Class`
  - **اسم الملف:** `kanban_board_screen.dart`
  - **المسار:** `lib/features/tasks/presentation/screens/kanban_board_screen.dart`
  - **المحتوى:** شاشة لوحة Kanban مع إدارة workflow المهام
  - **الشرح بالعراقي:** هاي شاشة لوحة Kanban للمهام. راح تعرض المهام بشكل أعمدة حسب الحالة مع إمكانية السحب والإفلات.
  - **ليش هذا التسلسل:** لأن Kanban Screen يحتاج Kanban Board Widget وTask Controllers
  - **الارتباطات:**
    - يرتبط بـ: `task_controller.dart`، `kanban_board.dart`، `task_card.dart`
    - يؤثر على: إدارة workflow المهام
    - مطلوب لـ: إدارة حالات المهام بصرياً
  - **مكونات UI/UX:** لوحة Kanban، أعمدة الحالات، drag & drop، إحصائيات
  - **الاختبار:** إدارة المهام من خلال لوحة Kanban

### 🔗 إنشاء Task Binding

#### **المهمة #128**
- [ ] **إنشاء Task Binding**
  - **نوع الملف:** `Dart Binding Class`
  - **اسم الملف:** `task_binding.dart`
  - **المسار:** `lib/features/tasks/presentation/bindings/task_binding.dart`
  - **المحتوى:** ربط جميع dependencies للمهام - Controllers، Use Cases، وRepositories
  - **الشرح بالعراقي:** هاي الBinding راح يربط كل الdependencies المتعلقة بالمهام. راح يحمل كل الControllers والUse Cases لما المستخدم يفتح أي شاشة مهام.
  - **ليش هذا التسلسل:** لأن الBinding يحتاج جميع المكونات تكون جاهزة قبل ما يربطها
  - **الارتباطات:**
    - يرتبط بـ: جميع Task Controllers والUse Cases والRepositories
    - يؤثر على: تحميل صفحات المهام
    - مطلوب لـ: تهيئة Dependencies للمهام
  - **مكونات UI/UX:** يضمن تحميل جميع المكونات بشكل صحيح
  - **الاختبار:** تحميل جميع dependencies عند فتح شاشة المهام

### 🚀 تحديث النظام الرئيسي للمهام

#### **المهمة #129**
- [ ] **تحديث App Routes للمهام**
  - **نوع الملف:** `Dart Class Update`
  - **اسم الملف:** `app_routes.dart`
  - **المسار:** `lib/app/routes/app_routes.dart`
  - **المحتوى:** إضافة مسارات شاشات المهام الجديدة
  - **الشرح بالعراقي:** إضافة مسارات شاشات إدارة المهام لنظام التنقل
  - **ليش هذا التسلسل:** لأن المسارات تحتاج الشاشات تكون جاهزة أول
  - **الارتباطات:**
    - يرتبط بـ: جميع Task Screens
    - يؤثر على: التنقل لشاشات المهام
    - مطلوب لـ: Navigation، Deep linking للمهام
  - **الاختبار:** التنقل لجميع شاشات المهام

#### **المهمة #130**
- [ ] **تحديث App Pages للمهام**
  - **نوع الملف:** `Dart Class Update`
  - **اسم الملف:** `app_pages.dart`
  - **المسار:** `lib/app/routes/app_pages.dart`
  - **المحتوى:** ربط مسارات المهام بالشاشات والBindings
  - **الشرح بالعراقي:** ربط مسارات المهام بالشاشات المناسبة والBindings المطلوبة
  - **ليش هذا التسلسل:** لأن هذا يعتمد على Routes والBindings
  - **الارتباطات:**
    - يرتبط بـ: `app_routes.dart`، `task_binding.dart`
    - يؤثر على: تحميل شاشات المهام
    - مطلوب لـ: GetX routing system للمهام
  - **الاختبار:** فتح جميع شاشات المهام من Routes

### ✅ اختبار المرحلة الخامسة

#### **اختبار شامل للمرحلة الخامسة**
- [ ] **اختبار جميع مكونات المرحلة الخامسة:**
  - إنشاء مهمة جديدة مع جميع التفاصيل
  - تخصيص مهمة لمصور مناسب
  - تحديث حالة المهمة وتتبع Timeline
  - البحث والفلترة في قوائم المهام
  - عرض المهام في التقويم
  - إدارة المهام من لوحة Kanban
  - Real-time updates عند تحديث المهام
  - التحقق من الصلاحيات حسب الدور
  - حذف المهام مع الحماية المطلوبة

---

**🎯 نتيجة المرحلة الخامسة:** نظام إدارة مهام متطور مع Kanban board، تعيين ذكي، وتتبع شامل للأداء. 