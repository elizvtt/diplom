
export const ukUACalendar = {
  // EventDialog
  colorPickerLabel: 'Колір події',
  dateTimeSectionLabel: 'Дата та час',
  resourceColorSectionLabel: 'Ресурс і колір',
  allDayLabel: 'Весь день',
  closeButtonAriaLabel: 'Закрити',
  closeButtonLabel: 'Закрити',
  deleteEvent: 'Видалити подію',
  descriptionLabel: 'Опис',
  endDateLabel: 'Дата завершення',
  endTimeLabel: 'Час завершення',
  eventTitleAriaLabel: 'Назва події',
  generalTabLabel: 'Основне',
  labelNoResource: 'Немає ресурсу',
  labelInvalidResource: 'Неправильний ресурс',
  recurrenceLabel: 'Повторення',
  recurrenceNoRepeat: 'Не повторювати',
  recurrenceCustomRepeat: 'Власне правило повторення',
  recurrenceDailyPresetLabel: 'Повторюється щодня',
  recurrenceDailyFrequencyLabel: 'дні',
  recurrenceEndsLabel: 'Закінчується',
  recurrenceEndsAfterLabel: 'Після',
  recurrenceEndsNeverLabel: 'Ніколи',
  recurrenceEndsUntilLabel: 'До',
  recurrenceEndsTimesLabel: 'раз(и)',
  recurrenceEveryLabel: 'Кожен',
  recurrenceRepeatLabel: 'Повторювати',
  recurrenceTabLabel: 'Повторення',
  recurrenceMainSelectCustomLabel: 'Повторення',
  recurrenceWeeklyFrequencyLabel: 'тижні',
  recurrenceWeeklyPresetLabel: (weekday) => `Повторюється щотижня в ${weekday}`,
  recurrenceMonthlyFrequencyLabel: 'місяці',
  recurrenceMonthlyDayOfMonthLabel: (dayNumber) => `День ${dayNumber}`,
  recurrenceMonthlyLastWeekAriaLabel: (weekDay) => `${weekDay} останнього тижня місяця`,
  recurrenceMonthlyLastWeekLabel: (weekDay) => `${weekDay} останній тиждень`,
  recurrenceMonthlyPresetLabel: (dayNumber) => `Повторюється щомісяця в день ${dayNumber}`,
  recurrenceMonthlyWeekNumberAriaLabel: (ord, weekDay) => `${weekDay} тиждень ${ord} місяця`,
  recurrenceMonthlyWeekNumberLabel: (ord, weekDay) => `${weekDay} тиждень ${ord}`,
  recurrenceWeeklyMonthlySpecificInputsLabel: 'У',
  recurrenceYearlyFrequencyLabel: 'роки',
  recurrenceYearlyPresetLabel: (date) => `Повторюється щороку ${date}`,
  noResourceAriaLabel: 'Без конкретного ресурсу',
  resourceLabel: 'Ресурс',
  saveChanges: 'Зберегти',
  startDateAfterEndDateError: 'Дата/час початку має бути раніше за дату/час завершення.',
  startDateLabel: 'Дата початку',
  startTimeLabel: 'Час початку',

  // ScopeDialog
  all: 'Усі події',
  cancel: 'Скасувати',
  confirm: 'Підтвердити',
  onlyThis: 'Лише цю подію',
  radioGroupAriaLabel: 'Редагування області повторюваних подій',
  thisAndFollowing: 'Цю та наступні події',
  title: 'Застосувати зміну до:',

  // ResourcesTree
  resourcesLabel: 'Ресурси',

  // ViewSwitcher
  agenda: 'Порядок денний',
  day: 'День',
  month: 'Місяць',
  other: 'Інші',
  today: 'Сьогодні',
  week: 'Тиждень',
  time: 'Час',
  days: 'Дні',
  months: 'Місяці',
  weeks: 'Тижні',
  years: 'Роки',

  // DateNavigator
  closeSidePanel: 'Закрити бічну панель',
  openSidePanel: 'Відкрити бічну панель',

  // Preferences menu
  amPm12h: '12-годинний (13:00 → 1:00 PM)',
  hour24h: '24-годинний (13:00)',
  preferencesMenu: 'Налаштування',
  showWeekends: 'Показувати вихідні',
  showEmptyDaysInAgenda: 'Показувати порожні дні',
  showWeekNumber: 'Показувати номер тижня',
  timeFormat: 'Формат часу',
  viewSpecificOptions: (view) => `Параметри подання «${view}»`,

  // WeekView
  allDay: 'Весь день',

  // MonthView
  hiddenEvents: (hiddenEventsCount) => `${hiddenEventsCount} ще..`,
  nextTimeSpan: (timeSpan) => `Наступний ${timeSpan}`,
  previousTimeSpan: (timeSpan) => `Попередній ${timeSpan}`,
  resourceAriaLabel: (resourceName) => `Ресурс: ${resourceName}`,
  weekAbbreviation: 'Т',
  weekNumberAriaLabel: (weekNumber) => `Тиждень ${weekNumber}`,

  // EventItem
  eventItemMultiDayLabel: (endDate) => `Закінчується ${endDate}`,

  // MiniCalendar
  miniCalendarLabel: 'Календар',
  miniCalendarGoToPreviousMonth: 'Показати попередній місяць у календарі',
  miniCalendarGoToNextMonth: 'Показати наступний місяць у календарі',

  // Timeline title sub grid
  timelineResourceTitleHeader: 'Назва ресурсу',
};