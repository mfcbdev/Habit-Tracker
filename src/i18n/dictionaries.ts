export type Lang = 'en' | 'es';

export const LANGUAGES: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'es', label: 'ES' },
];

/** Flat key → string map. Nested via dotted keys for readability, but always
 *  a single lookup — no runtime namespace resolution. */
type Dictionary = Record<string, string>;

const en: Dictionary = {
  'nav.today': 'Today',
  'nav.habits': 'Habits',
  'nav.schedule': 'Schedule',
  'nav.profile': 'Profile',
  'nav.createHabit': 'Create habit',

  'landing.brand': 'Habit Tracker',
  'landing.topbar.signIn': 'Sign in',
  'landing.topbar.getStarted': 'Get started',

  'landing.hero.eyebrow': 'A gentle, iOS-style habit tracker',
  'landing.hero.title': 'Build habits that build you.',
  'landing.hero.subtitle':
    'A simple daily practice, framed with wisdom from the books that shaped habit science. Points, streaks, and reminders keep you honest — the tools stay out of your way.',
  'landing.hero.ctaPrimary': 'Start free',
  'landing.hero.ctaSecondary': 'I have an account',

  'landing.features.eyebrow': 'What you get',
  'landing.features.day.title': 'One coherent day',
  'landing.features.day.body':
    'Today, week strip, and time-blocked schedule kept in sync so you always know what is next.',
  'landing.features.hp.title': 'Habit Points & ranks',
  'landing.features.hp.body':
    'Earn HP for every completion. Climb a 25-tier ladder from Iron to Radiant. Streaks and badges compound automatically.',
  'landing.features.reminders.title': 'Reminders that respect you',
  'landing.features.reminders.body':
    'Web-push notifications fire at the right moment in your own timezone. Skip a day when you need to.',
  'landing.features.books.title': 'Built on the classics',
  'landing.features.books.body':
    'Curated templates from Deep Work, Atomic Habits, and Can’t Hurt Me. Rotating daily wisdom on Today.',

  'landing.wisdom.eyebrow': 'Today’s wisdom',
  'landing.wisdom.footer': 'Rotates daily. Powered by',

  'landing.close.title': 'Ready when you are.',
  'landing.close.subtitle': 'Two minutes to sign up. No credit card.',
  'landing.close.ctaPrimary': 'Create an account',
  'landing.close.ctaSecondary': 'Sign in',

  'landing.footer.source': 'Source',
  'landing.footer.copyright': '© {{year}} Habit Tracker',

  'auth.login.eyebrow': 'Welcome back',
  'auth.login.title': 'Pick up where you left off.',
  'auth.login.email': 'Email',
  'auth.login.password': 'Password',
  'auth.login.submit': 'Sign in',
  'auth.login.noAccount': 'No account?',
  'auth.login.signup': 'Sign up',

  'auth.signup.eyebrow': 'Start a new habit',
  'auth.signup.title': 'Create your account.',
  'auth.signup.email': 'Email',
  'auth.signup.password': 'Password',
  'auth.signup.submit': 'Sign up',
  'auth.signup.haveAccount': 'Already have an account?',
  'auth.signup.signin': 'Sign in',

  'profile.section.appearance': 'Appearance',
  'profile.appearance.theme': 'Theme',
  'profile.appearance.language': 'Language',
  'profile.appearance.sound': 'Sound on completion',
  'theme.light': 'Light',
  'theme.dark': 'Dark',
  'theme.system': 'System',

  'common.language': 'Language',
};

const es: Dictionary = {
  'nav.today': 'Hoy',
  'nav.habits': 'Hábitos',
  'nav.schedule': 'Agenda',
  'nav.profile': 'Perfil',
  'nav.createHabit': 'Crear hábito',

  'landing.brand': 'Habit Tracker',
  'landing.topbar.signIn': 'Iniciar sesión',
  'landing.topbar.getStarted': 'Empezar',

  'landing.hero.eyebrow': 'Un tracker de hábitos suave, al estilo iOS',
  'landing.hero.title': 'Construí hábitos que te construyan.',
  'landing.hero.subtitle':
    'Una práctica diaria simple, apoyada en la sabiduría de los libros que dieron forma a la ciencia de los hábitos. Puntos, rachas y recordatorios te mantienen honesto — las herramientas no te estorban.',
  'landing.hero.ctaPrimary': 'Empezar gratis',
  'landing.hero.ctaSecondary': 'Ya tengo cuenta',

  'landing.features.eyebrow': 'Qué obtenés',
  'landing.features.day.title': 'Un día coherente',
  'landing.features.day.body':
    'Hoy, la tira semanal y la agenda por bloques quedan sincronizadas para que siempre sepas qué sigue.',
  'landing.features.hp.title': 'Puntos de hábito y rangos',
  'landing.features.hp.body':
    'Ganás HP en cada tarea. Escalá una escalera de 25 niveles de Hierro a Radiante. Rachas e insignias se acumulan solas.',
  'landing.features.reminders.title': 'Recordatorios que te respetan',
  'landing.features.reminders.body':
    'Las notificaciones web-push llegan en el momento justo en tu zona horaria. Saltate un día cuando lo necesites.',
  'landing.features.books.title': 'Basado en los clásicos',
  'landing.features.books.body':
    'Plantillas curadas de Deep Work, Atomic Habits y Can’t Hurt Me. Frases rotativas cada día en la pantalla Hoy.',

  'landing.wisdom.eyebrow': 'La sabiduría de hoy',
  'landing.wisdom.footer': 'Rota cada día. Por',

  'landing.close.title': 'Cuando estés listo.',
  'landing.close.subtitle': 'Dos minutos para registrarte. Sin tarjeta.',
  'landing.close.ctaPrimary': 'Crear una cuenta',
  'landing.close.ctaSecondary': 'Iniciar sesión',

  'landing.footer.source': 'Código',
  'landing.footer.copyright': '© {{year}} Habit Tracker',

  'auth.login.eyebrow': 'Bienvenido de vuelta',
  'auth.login.title': 'Retomá donde lo dejaste.',
  'auth.login.email': 'Correo',
  'auth.login.password': 'Contraseña',
  'auth.login.submit': 'Iniciar sesión',
  'auth.login.noAccount': '¿No tenés cuenta?',
  'auth.login.signup': 'Registrate',

  'auth.signup.eyebrow': 'Empezá un nuevo hábito',
  'auth.signup.title': 'Creá tu cuenta.',
  'auth.signup.email': 'Correo',
  'auth.signup.password': 'Contraseña',
  'auth.signup.submit': 'Registrarme',
  'auth.signup.haveAccount': '¿Ya tenés cuenta?',
  'auth.signup.signin': 'Iniciar sesión',

  'profile.section.appearance': 'Apariencia',
  'profile.appearance.theme': 'Tema',
  'profile.appearance.language': 'Idioma',
  'profile.appearance.sound': 'Sonido al completar',
  'theme.light': 'Claro',
  'theme.dark': 'Oscuro',
  'theme.system': 'Sistema',

  'common.language': 'Idioma',
};

export const DICTIONARIES: Record<Lang, Dictionary> = { en, es };
