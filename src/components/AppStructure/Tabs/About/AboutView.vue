<template>
  <div class="about pa-4" dir="rtl">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <!-- Header Section -->
          <div class="text-center mb-8">
            <v-icon size="80" color="primary" class="mb-4">mdi-shield-check</v-icon>
            <h1 class="text-h3 font-weight-bold mb-4">אודותינו</h1>
            <p class="text-h6 text-medium-emphasis">מערכת ממונים - ניהול בטיחות מקצועי</p>
          </div>

          <!-- Mission Section -->
          <v-card class="mb-6" elevation="2">
            <v-card-title class="text-h5 pb-2">
              <v-icon class="mr-2" color="primary">mdi-target</v-icon>
              המשימה שלנו
            </v-card-title>
            <v-card-text>
              <p class="text-body-1 mb-4">
                מערכת ממונים הוקמה במטרה לספק פתרון מקיף ומקצועי לניהול בטיחות במקומות עבודה. 
                אנו מחויבים לסייע לארגונים ולמפעלים לשמור על סביבת עבודה בטוחה, 
                להפחית סיכונים ולעמוד בכל התקנות והחוקים הרלוונטיים.
              </p>
              <p class="text-body-1">
                המערכת שלנו מאפשרת ניהול יעיל של תהליכי בטיחות, מעקב אחר תאונות, 
                ניהול ועדות בטיחות, ביצוע בדיקות שגרתיות ועוד.
              </p>
            </v-card-text>
          </v-card>

          <!-- Features Section -->
          <v-card class="mb-6" elevation="2">
            <v-card-title class="text-h5 pb-2">
              <v-icon class="mr-2" color="primary">mdi-star-circle</v-icon>
              מה אנחנו מציעים
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="6" v-for="feature in features" :key="feature.title">
                  <div class="d-flex align-start mb-4">
                    <v-icon color="primary" class="mr-3 mt-1">{{ feature.icon }}</v-icon>
                    <div>
                      <h4 class="text-subtitle-1 font-weight-bold mb-1">{{ feature.title }}</h4>
                      <p class="text-body-2 text-medium-emphasis">{{ feature.description }}</p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Values Section -->
          <v-card class="mb-6" elevation="2">
            <v-card-title class="text-h5 pb-2">
              <v-icon class="mr-2" color="primary">mdi-heart</v-icon>
              הערכים שלנו
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" md="4" v-for="value in values" :key="value.title">
                  <v-card variant="outlined" class="text-center pa-4 h-100">
                    <v-icon size="48" color="primary" class="mb-3">{{ value.icon }}</v-icon>
                    <h4 class="text-subtitle-1 font-weight-bold mb-2">{{ value.title }}</h4>
                    <p class="text-body-2">{{ value.description }}</p>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Contact Section -->
          <v-card elevation="2">
            <v-card-title class="text-h5 pb-2">
              <v-icon class="mr-2" color="primary">mdi-email</v-icon>
              צור קשר
            </v-card-title>
            <v-card-text>
              <p class="text-body-1 mb-4">
                יש לך שאלות או הצעות? נשמח לשמוע ממך!
              </p>
              <div class="d-flex flex-column flex-sm-row gap-3">
                <v-btn color="primary" variant="outlined" prepend-icon="mdi-email">
                  שלח הודעה
                </v-btn>
                <v-btn color="primary" variant="outlined" prepend-icon="mdi-phone">
                  התקשר אלינו
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  name: 'AboutView',
  data() {
    return {
      features: [
      {
          title: 'בדיקות שגרתיות',
          description: 'תכנון וביצוע בדיקות בטיחות תקופתיות',
          icon: 'mdi-clipboard-check'
        },
        {
          title: 'ניהול מפגעים',
          description: 'זיהוי וניהול מפגעים במקום העבודה',
          icon: 'mdi-shield-alert'
        },
        {
          title: 'תיעד תאונות',
          description: 'מעקב ותיעוד מקצועי של תאונות עבודה',
          icon: 'mdi-alert-circle'
        },
      
        
        {
          title: 'ועדות בטיחות',
          description: 'ניהול ועדות בטיחות ותיעוד ישיבות',
          icon: 'mdi-account-group'
        },
        {
          title: 'נהלי בטיחות',
          description: 'יצירה וניהול נהלי בטיחות מפורטים',
          icon: 'mdi-file-document'
        },
        {
          title: 'דוחות ומעקב',
          description: 'דוחות מפורטים ומעקב אחר ביצועים',
          icon: 'mdi-chart-line'
        }
      ],
      values: [
        {
          title: 'מקצועיות',
          description: 'צוות מקצועי עם ניסיון רב בתחום הבטיחות',
          icon: 'mdi-school'
        },
        {
          title: 'אמינות',
          description: 'מערכת אמינה ובטוחה לניהול מידע רגיש',
          icon: 'mdi-shield-lock'
        },
        {
          title: 'שירות',
          description: 'שירות לקוחות מקצועי ותמיכה מלאה',
          icon: 'mdi-headset'
        }
      ]
    }
  }
}
</script>

<style scoped>
.about {
  min-height: 100vh;
  padding-top: 80px;
}

.app-logo {
  height: 80px;
  width: auto;
  object-fit: contain;
}
</style>
