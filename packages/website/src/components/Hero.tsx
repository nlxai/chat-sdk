import React from "react";
import { useLocation } from "react-router-dom";
import { Disclaimer } from "../custom-components/Disclaimer";
import { FeedbackForm } from "../custom-components/FeedbackForm";
import { Carousel } from "../custom-components/Carousel";

export const Hero = () => {
  const location = useLocation();
  const pathname =
    location.pathname === "/" ? "/getting-started" : location.pathname;
  if (pathname !== "/getting-started") {
    return null;
  }
  return (
    <div className="overflow-hidden bg-slate-900 dark:-mb-32 dark:mt-[-4.75rem] dark:pb-32 dark:pt-[4.75rem]">
      <div className="py-16 sm:px-2 lg:relative lg:px-0 lg:py-20">
        <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 px-4 lg:max-w-8xl lg:grid-cols-2 lg:px-8 xl:gap-x-16 xl:px-12">
          <div className="relative z-10 md:text-center lg:text-left">
            <div className="relative">
              <p className="inline bg-gradient-to-r from-indigo-200 via-sky-400 to-indigo-200 bg-clip-text font-display text-5xl tracking-tight text-transparent">
                The NLX Chat Experience
              </p>
              <p className="mt-3 text-2xl tracking-tight text-slate-400">
                Install a beautiful chat widget on your website in seconds. Add
                custom components using a low-code setup, or engineer it from
                the ground up yourself.
              </p>
              <div className="mt-8 flex gap-4 md:justify-center lg:justify-start">
                <a
                  className="rounded-full bg-sky-300 py-2 px-4 text-sm font-semibold text-slate-900 hover:bg-sky-200 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/50 active:bg-sky-500"
                  href="/"
                >
                  Get started
                </a>
                <a
                  className="rounded-full bg-slate-800 py-2 px-4 text-sm font-medium text-white hover:bg-slate-700 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 active:text-slate-400"
                  href="https://github.com/nlxai/chat-sdk"
                >
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
          <div className="relative lg:static xl:pl-10">
            <div className="bg-white rounded-2xl max-h-[360px] overflow-auto p-4 space-y-4">
              <Disclaimer />
              <FeedbackForm />
              <Carousel
                data={[
                  {
                    id: "1",
                    name: "Name",
                    description: "Description",
                    imageUrl:
                      "https://plus.unsplash.com/premium_photo-1694425773107-c3c44e345e1e?auto=format&fit=crop&q=80&w=388&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    url: ""
                  },
                  {
                    id: "2",
                    name: "Name",
                    description: "Description",
                    imageUrl:
                      "https://plus.unsplash.com/premium_photo-1695558759057-7922f0d53386?auto=format&fit=crop&q=80&w=387&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    url: ""
                  },
                  {
                    id: "3",
                    name: "Name",
                    description: "Description",
                    imageUrl:
                      "https://images.unsplash.com/photo-1668854360535-4537b57d615f?auto=format&fit=crop&q=80&w=387&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                    url: ""
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
