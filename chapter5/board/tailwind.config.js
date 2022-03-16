module.exports = {
  content: ["./src/**/*.{html,js}", "./views/**/*.handlebars"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: false,
  },
};
