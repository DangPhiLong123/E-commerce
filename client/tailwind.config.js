/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    fontFamily: {
      main: ["Poppins", "sans-serif;"],
    },
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      width: {
        main: "1220px",
      },
      maxWidth: {
        main: "1220px",
      },
      gridTemplateRows: {
        '10': 'repeat(10, minmax(0, 1fr))',

        'layout': 'repeat(10, minmax(0, 1fr))',
      },
      backgroundColor: {
        main: "#ee3131",
        overlay: 'rgba(0,0,0,0.3)'
      },
      colors: {
        main: "#ee3131",
      },
      flex: {
        '2': '2 2 0%',
        '3': '3 3 0%',
        '4': '4 4 0%',
        '5': '5 5 0%',
        '6': '6 6 0%',
        '7': '7 7 0%',
        '8': '8 8 0%',


      },
      keyframes: {
        'slide-top': {
          '0%': {
            '-webkit-transform': 'translateY(20px)',
                    transform: 'translateY(20px)',
          },
          '100%': {
            '-webkit-transform': 'translateY(0px)',
                    transform: 'translateY(0px)',
          }
        },
        'slide-top-sm': {
          '0%': {
            '-webkit-transform': 'translateY(8px)',
                    transform: 'translateY(8px)',
          },
          '100%': {
            '-webkit-transform': 'translateY(0px)',
                    transform: 'translateY(0px)',
          }
        },
        'slide-right': {
          '0%': {
            '-webkit-transform': 'translateX(-1000px)',
                    transform: 'translateX(-1000px)',
          },
          '100%': {
            '-webkit-transform': 'translateX(0px)',
                    transform: 'translateX(0px)',
          }
        }
      },
      animation: {
        'slide-top': 'slide-top 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both',
        'slide-top-sm': 'slide-top-sm 0.2s linear both',
        'slide-right': 'slide-right 0.5s cubic-bezier(0.250, 0.460, 0.450, 0.940) both'

      }
      
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/forms')({strategy: 'class'}),
  ],
};
