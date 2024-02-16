// PacMan Animation

export const Pacman = () => (
  <div>
    <style>
      {`
        @keyframes chomp {
          from {
            stroke-dasharray: 157,100;
            stroke-dashoffset: 0;
          }
          to {
            stroke-dasharray: 126,100;
            stroke-dashoffset: -15;
          }
        }
        @keyframes dots {
          from {
            width: 95%;
          }
          to {
            width: 5%;
          }
        }
      `}
    </style>
    <div className="w-vw -ml-1 -mr-1 box-border overflow-hidden bg-wai-gray">
      <div className="h-3 w-full rounded-xl"></div>
      <div className="path relative -ml-[200px] -mr-[200px] mb-2 mt-2 h-20">
        <div
          className="float-right h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(to left, #efefef 20%, transparent 0%)",
            backgroundPosition: "center right",
            backgroundSize: "50px 10px",
            backgroundRepeat: "repeat-x",
            animation: "dots 5s linear infinite",
          }}
        >
          <svg className="h-full" viewBox="0 0 100 100">
            <circle
              className="animated-circle fill-none stroke-[#ffee00] stroke-[50%]"
              style={{ animation: "chomp .15s linear infinite alternate" }}
              cx="50%"
              cy="50%"
              r="25%"
            ></circle>
          </svg>
        </div>
      </div>
      <div className="h-3 w-full rounded-xl"></div>
    </div>
  </div>
);
