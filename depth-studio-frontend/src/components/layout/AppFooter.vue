<!--
==============================================
DEPTH STUDIO - مكون التذييل
App Footer Component
==============================================
-->

<template>
  <footer 
    class="footer" 
    :class="footerClasses"
    role="contentinfo"
  >
    <div class="footer__container">
      <!-- المحتوى الرئيسي للتذييل -->
      <div class="footer__content">
        <!-- معلومات الشركة -->
        <div class="footer__section footer__section--brand">
          <div class="footer__brand">
            <BaseIcon 
              :name="brandLogo" 
              class="footer__brand-logo"
            />
            <span class="footer__brand-text">{{ brandName }}</span>
          </div>
          
          <p 
            v-if="description" 
            class="footer__description"
          >
            {{ description }}
          </p>
          
          <!-- وسائل التواصل الاجتماعي -->
          <div 
            v-if="socialLinks.length > 0" 
            class="footer__social"
          >
            <a
              v-for="(link, index) in socialLinks"
              :key="index"
              :href="link.url"
              :aria-label="link.label"
              class="footer__social-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BaseIcon 
                :name="link.icon" 
                size="sm"
              />
            </a>
          </div>
        </div>

        <!-- أقسام الروابط -->
        <div 
          v-for="(section, sectionIndex) in linkSections"
          :key="sectionIndex"
          class="footer__section"
        >
          <h3 class="footer__section-title">{{ section.title }}</h3>
          <ul class="footer__links">
            <li
              v-for="(link, linkIndex) in section.links"
              :key="linkIndex"
              class="footer__link-item"
            >
              <router-link
                v-if="link.route"
                :to="link.route"
                class="footer__link"
              >
                {{ link.label }}
              </router-link>
              <a
                v-else-if="link.href"
                :href="link.href"
                class="footer__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ link.label }}
              </a>
              <button
                v-else-if="link.action"
                class="footer__link footer__link--button"
                @click="handleLinkAction(link)"
              >
                {{ link.label }}
              </button>
            </li>
          </ul>
        </div>

        <!-- معلومات الاتصال -->
        <div 
          v-if="showContact" 
          class="footer__section footer__section--contact"
        >
          <h3 class="footer__section-title">تواصل معنا</h3>
          <div class="footer__contact">
            <div 
              v-if="contactInfo.email"
              class="footer__contact-item"
            >
              <BaseIcon 
                name="email-outline" 
                class="footer__contact-icon"
              />
              <a 
                :href="`mailto:${contactInfo.email}`"
                class="footer__contact-link"
              >
                {{ contactInfo.email }}
              </a>
            </div>
            
            <div 
              v-if="contactInfo.phone"
              class="footer__contact-item"
            >
              <BaseIcon 
                name="phone-outline" 
                class="footer__contact-icon"
              />
              <a 
                :href="`tel:${contactInfo.phone}`"
                class="footer__contact-link"
              >
                {{ contactInfo.phone }}
              </a>
            </div>
            
            <div 
              v-if="contactInfo.address"
              class="footer__contact-item"
            >
              <BaseIcon 
                name="map-marker-outline" 
                class="footer__contact-icon"
              />
              <span class="footer__contact-text">
                {{ contactInfo.address }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- شريط التذييل السفلي -->
      <div class="footer__bottom">
        <div class="footer__bottom-content">
          <!-- حقوق النشر -->
          <div class="footer__copyright">
            <span>© {{ currentYear }} {{ brandName }}. جميع الحقوق محفوظة.</span>
          </div>

          <!-- روابط قانونية -->
          <div 
            v-if="legalLinks.length > 0" 
            class="footer__legal"
          >
            <router-link
              v-for="(link, index) in legalLinks"
              :key="index"
              :to="link.route || '/'"
              class="footer__legal-link"
            >
              {{ link.label }}
            </router-link>
          </div>

          <!-- معلومات إضافية -->
          <div 
            v-if="showVersion" 
            class="footer__version"
          >
            الإصدار {{ version }}
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseIcon from '../ui/BaseIcon.vue'

// ===============================
// 🏷️ COMPONENT INTERFACES
// ===============================

interface FooterLink {
  label: string
  route?: string
  href?: string
  action?: string
}

interface LinkSection {
  title: string
  links: FooterLink[]
}

interface SocialLink {
  label: string
  icon: string
  url: string
}

interface ContactInfo {
  email?: string
  phone?: string
  address?: string
}

// ===============================
// 🎛️ COMPONENT PROPS
// ===============================

interface FooterProps {
  // العرض والإعدادات
  variant?: 'default' | 'minimal' | 'extended'
  sticky?: boolean
  
  // المحتوى
  brandName?: string
  brandLogo?: string
  description?: string
  linkSections?: LinkSection[]
  socialLinks?: SocialLink[]
  legalLinks?: FooterLink[]
  
  // معلومات الاتصال
  showContact?: boolean
  contactInfo?: ContactInfo
  
  // إعدادات إضافية
  showVersion?: boolean
  version?: string
  theme?: 'light' | 'dark' | 'auto'
}

const props = withDefaults(defineProps<FooterProps>(), {
  variant: 'default',
  sticky: false,
  brandName: 'Depth Studio',
  brandLogo: 'camera-outline',
  description: 'منصة احترافية لإدارة جلسات التصوير الفوتوغرافي والتعاون مع العلامات التجارية',
  linkSections: () => [
    {
      title: 'الميزات',
      links: [
        { label: 'إدارة المشاريع', route: '/features/projects' },
        { label: 'إدارة المصورين', route: '/features/photographers' },
        { label: 'إدارة العلامات التجارية', route: '/features/brands' },
        { label: 'التقارير والتحليلات', route: '/features/analytics' }
      ]
    },
    {
      title: 'الدعم',
      links: [
        { label: 'مركز المساعدة', route: '/help' },
        { label: 'الأسئلة الشائعة', route: '/faq' },
        { label: 'التوثيق', route: '/docs' },
        { label: 'تواصل معنا', route: '/contact' }
      ]
    },
    {
      title: 'الشركة',
      links: [
        { label: 'من نحن', route: '/about' },
        { label: 'المدونة', route: '/blog' },
        { label: 'الوظائف', route: '/careers' },
        { label: 'الشراكات', route: '/partnerships' }
      ]
    }
  ],
  socialLinks: () => [
    { label: 'تويتر', icon: 'twitter', url: 'https://twitter.com/depthstudio' },
    { label: 'إنستغرام', icon: 'instagram', url: 'https://instagram.com/depthstudio' },
    { label: 'لينكد إن', icon: 'linkedin', url: 'https://linkedin.com/company/depthstudio' },
    { label: 'يوتيوب', icon: 'youtube', url: 'https://youtube.com/depthstudio' }
  ],
  legalLinks: () => [
    { label: 'الخصوصية', route: '/privacy' },
    { label: 'الشروط والأحكام', route: '/terms' },
    { label: 'ملفات تعريف الارتباط', route: '/cookies' }
  ],
  showContact: true,
  contactInfo: () => ({
    email: 'info@depthstudio.com',
    phone: '+966 11 123 4567',
    address: 'الرياض، المملكة العربية السعودية'
  }),
  showVersion: false,
  version: '1.0.0',
  theme: 'auto'
})

// ===============================
// 🎯 COMPONENT EVENTS
// ===============================

interface FooterEmits {
  'link-action': [action: string]
}

const emit = defineEmits<FooterEmits>()

// ===============================
// 💻 COMPUTED PROPERTIES
// ===============================

// فئات CSS
const footerClasses = computed(() => [
  `footer--${props.variant}`,
  {
    'footer--sticky': props.sticky
  }
])

// السنة الحالية
const currentYear = computed(() => new Date().getFullYear())

// ===============================
// 🎯 METHODS
// ===============================

const handleLinkAction = (link: FooterLink) => {
  if (link.action) {
    emit('link-action', link.action)
  }
}
</script>

<style lang="scss" scoped>
/**
 * ==============================================
 * FOOTER COMPONENT STYLES
 * ==============================================
 */

@use '../../styles/foundation/variables' as *;
@use '../../styles/foundation/colors' as *;
@use '../../styles/foundation/spacing' as *;
@use '../../styles/foundation/typography' as *;
@use '../../styles/foundation/breakpoints' as *;
@use '../../styles/utilities/mixins' as *;

.footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-divider);
  margin-top: auto;
  
  // التثبيت السفلي
  &--sticky {
    position: sticky;
    bottom: 0;
    z-index: map-get($z-index, "docked");
  }
  
  // المتغيرات
  &--minimal {
    .footer__content {
      grid-template-columns: 1fr;
      text-align: center;
    }
    
    .footer__section:not(.footer__section--brand) {
      display: none;
    }
  }
  
  &--extended {
    .footer__content {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--spacing-xl);
    }
  }
  
  // الحاوي
  &__container {
    @include container;
    padding: var(--spacing-xl) var(--spacing-md);
    
    @include mobile-layout {
      padding: var(--spacing-lg) var(--spacing-sm);
    }
  }
  
  // المحتوى الرئيسي
  &__content {
    display: grid;
    grid-template-columns: 2fr repeat(3, 1fr);
    gap: var(--spacing-lg);
    margin-bottom: var(--spacing-xl);
    
    @include tablet-layout {
      grid-template-columns: repeat(2, 1fr);
      gap: var(--spacing-md);
    }
    
    @include mobile-layout {
      grid-template-columns: 1fr;
      gap: var(--spacing-lg);
      text-align: center;
    }
  }
  
  // الأقسام
  &__section {
    &--brand {
      @include mobile-layout {
        order: -1;
      }
    }
    
    &--contact {
      @include mobile-layout {
        order: 1;
      }
    }
    
    &-title {
      @include text-style("title-medium");
      color: var(--color-text-primary);
      margin-bottom: var(--spacing-md);
      font-weight: var(--font-weight-semibold);
    }
  }
  
  // العلامة التجارية
  &__brand {
    @include flex-start(row, var(--spacing-sm));
    margin-bottom: var(--spacing-md);
    
    @include mobile-layout {
      justify-content: center;
    }
    
    &-logo {
      @include size(32px);
      color: var(--color-primary);
    }
    
    &-text {
      @include text-style("title-large");
      color: var(--color-text-primary);
      font-weight: var(--font-weight-bold);
    }
  }
  
  &__description {
    @include text-style("body");
    color: var(--color-text-secondary);
    line-height: var(--line-height-relaxed);
    margin-bottom: var(--spacing-md);
  }
  
  // وسائل التواصل الاجتماعي
  &__social {
    @include flex-start(row, var(--spacing-sm));
    
    @include mobile-layout {
      justify-content: center;
    }
    
    &-link {
      @include flex-center;
      @include size(40px);
      @include border-radius("md");
      background: var(--color-surface-variant);
      color: var(--color-text-secondary);
      @include transition(all, "fast");
      
      &:hover {
        background: var(--color-primary);
        color: var(--color-on-primary);
        transform: translateY(-2px);
      }
      
      &:focus-visible {
        @include focus-effect;
      }
    }
  }
  
  // قوائم الروابط
  &__links {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  &__link-item {
    & + & {
      margin-top: var(--spacing-sm);
    }
  }
  
  &__link {
    @include text-style("body");
    color: var(--color-text-secondary);
    text-decoration: none;
    @include transition(color, "fast");
    
    &:hover {
      color: var(--color-primary);
    }
    
    &:focus-visible {
      @include focus-effect;
    }
    
    &--button {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      font-family: inherit;
      font-size: inherit;
      text-align: right;
      
      [dir="ltr"] & {
        text-align: left;
      }
    }
  }
  
  // معلومات الاتصال
  &__contact {
    &-item {
      @include flex-start(row, var(--spacing-sm));
      margin-bottom: var(--spacing-sm);
      
      @include mobile-layout {
        justify-content: center;
      }
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    &-icon {
      @include size(16px);
      color: var(--color-text-hint);
      flex-shrink: 0;
    }
    
    &-link,
    &-text {
      @include text-style("body-small");
      color: var(--color-text-secondary);
      text-decoration: none;
      @include transition(color, "fast");
    }
    
    &-link:hover {
      color: var(--color-primary);
    }
  }
  
  // التذييل السفلي
  &__bottom {
    border-top: 1px solid var(--color-divider);
    padding-top: var(--spacing-md);
    
    &-content {
      @include flex-between;
      @include flex-wrap;
      gap: var(--spacing-md);
      
      @include mobile-layout {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: var(--spacing-sm);
      }
    }
  }
  
  &__copyright {
    @include text-style("body-small");
    color: var(--color-text-hint);
  }
  
  &__legal {
    @include flex-start(row, var(--spacing-md));
    
    @include mobile-layout {
      flex-wrap: wrap;
      justify-content: center;
      gap: var(--spacing-sm);
    }
    
    &-link {
      @include text-style("body-small");
      color: var(--color-text-hint);
      text-decoration: none;
      @include transition(color, "fast");
      
      &:hover {
        color: var(--color-text-secondary);
      }
      
      &:focus-visible {
        @include focus-effect;
      }
    }
  }
  
  &__version {
    @include text-style("caption");
    color: var(--color-text-hint);
    background: var(--color-surface-variant);
    padding: var(--spacing-xs) var(--spacing-sm);
    @include border-radius("sm");
  }
}

// الطباعة
@media print {
  .footer {
    display: none !important;
  }
}
</style> 