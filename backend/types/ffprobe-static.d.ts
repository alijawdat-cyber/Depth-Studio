/**
 * 🎬 TypeScript Declaration لـ ffprobe-static
 * ===============================================
 * 
 * 📅 محدث: ديسمبر 2024
 * 👨‍💻 المطور: علي جودت
 * 🎯 الهدف: حل مشكلة أنواع ffprobe-static
 */

declare module 'ffprobe-static' {
  /**
   * مسار ffprobe binary الثابت
   * يُستخدم مع fluent-ffmpeg لاستخراج معلومات الفيديو
   */
  const ffprobePath: string;
  export = ffprobePath;
} 