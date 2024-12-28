document.addEventListener("DOMContentLoaded", function () {
  let lottieContainer = document.querySelectorAll(".animation");

  if (lottieContainer) {
    LottieScrollTrigger({
      trigger: ".animation",
      start: "top center",
      endTrigger: ".end-lottie",
      end: `bottom center+=${
        document.querySelector(".animation").offsetHeight
      }`,
      renderer: "svg",
      target: ".animation",
      path: "./RESHNY.json",
      scrub: 2,
    });
  }
});

function LottieScrollTrigger(vars) {
  let playhead = { frame: 0 },
    target = gsap.utils.toArray(vars.target)[0],
    speeds = { slow: "+=2000", medium: "+=1000", fast: "+=500" },
    st = {
      trigger: ".trigger",
      end: speeds[vars.speed] || "+=100",
      scrub: 1,
      markers: false,
    },
    ctx = gsap.context && gsap.context(),
    animation = lottie.loadAnimation({
      container: target,
      renderer: vars.renderer || "svg",
      loop: false,
      autoplay: false,
      path: vars.path,
      rendererSettings: vars.rendererSettings || {
        preserveAspectRatio: "xMidYMid slice",
      },
    });

  for (let p in vars) {
    st[p] = vars[p];
  }

  animation.addEventListener("DOMLoaded", function () {
    let createTween = function () {
      animation.frameTween = gsap.to(playhead, {
        frame: animation.totalFrames - 1,
        ease: "none",
        onUpdate: () => animation.goToAndStop(playhead.frame, true),
        scrollTrigger: st,
      });
      return () => animation.destroy && animation.destroy();
    };
    ctx && ctx.add ? ctx.add(createTween) : createTween();
  });

  return animation;
}
