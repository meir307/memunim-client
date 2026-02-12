<template>
  <v-dialog v-model="dialog" max-width="900px" persistent>
    <v-card>
      <v-card-title class="popup-title d-flex align-center justify-space-between">
        תנאי שימוש
        <v-btn icon="mdi-close" variant="text" @click="closeDialog"></v-btn>
      </v-card-title>
      <v-card-text>
        <div class="license-content" dir="rtl">
          <div v-html="displayText" class="text-body-1"></div>
        </div>
        
        <div class="popup-btn-row mt-4">
          <v-btn @click="closeDialog" color="primary">סגור</v-btn>
          <v-spacer></v-spacer>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'LicenseAgreement',
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    agreementText: {
      type: String,
      default: ''
    }
  },
  emits: ['btnClose'],
  data() {
    return {
      dialog: false,
      defaultAgreementText: `
        <h3 class="mb-4">תנאי שימוש במערכת ממונים</h3>
        
        <p class="mb-3">
          <strong>1. הגדרות</strong><br>
          המערכת "ממונים" היא מערכת לניהול בטיחות במקומות עבודה. השימוש במערכת כפוף לתנאים המפורטים להלן.
        </p>
        
        <p class="mb-3">
          <strong>2. זכויות יוצרים</strong><br>
          כל הזכויות במערכת, כולל קוד המקור, עיצוב, ממשק משתמש ותכנים, שמורות למפתחי המערכת. אסור להעתיק, לשכפל, להפיץ או לעשות שימוש מסחרי במערכת ללא רישיון מפורש.
        </p>
        
        <p class="mb-3">
          <strong>3. שימוש מותר</strong><br>
          המשתמש רשאי להשתמש במערכת למטרות ניהול בטיחות במקומות עבודה בלבד, בהתאם להוראות החוק והתקנות הרלוונטיות.
        </p>
        
        <p class="mb-3">
          <strong>4. אחריות</strong><br>
          המערכת מסופקת "כפי שהיא" ללא כל אחריות מפורשת או משתמעת. מפתחי המערכת לא יהיו אחראים לכל נזק ישיר או עקיף שייגרם כתוצאה משימוש במערכת.
        </p>
        
        <p class="mb-3">
          <strong>5. שמירת סודיות</strong><br>
          המשתמש מתחייב לשמור על סודיות פרטי הגישה למערכת ולא לחשוף אותם לצדדים שלישיים.
        </p>
        
        <p class="mb-3">
          <strong>6. שינויים בהסכם</strong><br>
          מפתחי המערכת שומרים לעצמם את הזכות לשנות את תנאי ההסכם מעת לעת. המשך השימוש במערכת לאחר שינוי התנאים מהווה הסכמה לתנאים החדשים.
        </p>
        
        <p class="mb-3">
          <strong>7. ביטול</strong><br>
          מפתחי המערכת שומרים לעצמם את הזכות להפסיק את השירות או לבטל את גישת המשתמש בכל עת, ללא הודעה מוקדמת, אם המשתמש הפר את תנאי ההסכם.
        </p>
        
        <p class="mb-3">
          <strong>8. חוק שולט</strong><br>
          הסכם זה כפוף לחוקי מדינת ישראל. כל מחלוקת תידון בפני בתי המשפט המוסמכים בישראל.
        </p>
        
        <p class="mt-4">
          <strong>תאריך עדכון אחרון:</strong> ${new Date().toLocaleDateString('he-IL')}
        </p>
      `
    }
  },
  watch: {
    showDialog(newVal) {
      this.dialog = newVal
    },
    dialog(newVal) {
      if (!newVal) {
        this.$emit('btnClose')
      }
    }
  },
  computed: {
    displayText() {
      return this.agreementText || this.defaultAgreementText
    }
  },
  methods: {
    closeDialog() {
      this.dialog = false
    }
  }
}
</script>

<style scoped>
.license-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
  line-height: 1.8;
}

.license-content h3 {
  color: #1976d2;
  font-weight: bold;
}

.license-content p {
  margin-bottom: 16px;
  text-align: right;
}

.license-content strong {
  color: #333;
  font-weight: bold;
}

.popup-btn-row {
  direction: ltr;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 16px;
  margin-top: 24px;
  margin-bottom: 8px;
}

/* Scrollbar styling for better UX */
.license-content::-webkit-scrollbar {
  width: 8px;
}

.license-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.license-content::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.license-content::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

