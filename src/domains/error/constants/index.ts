export const ERROR_LABELS = {
  NOT_FOUND: {
    TITLE: 'Page Not Found️ ⚠️',
    DESCRIPTION: "We couldn't find the page you are looking for",
    BUTTON: 'Back to Home Page',
  },
  SERVER_ERROR: {
    CODE: '500',
    TITLE: 'Something went wrong',
    DESCRIPTION: "The page you're looking for isn't found, we suggest you back to home.",
    BUTTON: 'Back to Home',
  },
} as const;
