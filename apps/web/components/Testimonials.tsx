const testimonials = [
  [
    {
      content: "NFT Info Fetch API",
      link: "/",
      author: {
        name: "Sub 100ms reponse times",
        role: "We cache NFT data at the edge to help you deliver great user experiences with web 3 technologies.",
      },
    },

    {
      content:
        "Bring your own data or use our API to upload metadata offchain.",
      link: "/",
      author: {
        name: "Leverage the next generation of NFTs at scale.",
        role: "Solana compressed NFTs deliver the benefits of NFTs for use in your game or application.",
      },
    },
    {
      content: "Mintee.js",
      link: "/",
      author: {
        name: "Our TypeScript library makes it easy to mint NFTs for any application.",
        role: "Solana NFTs are a global phenomenon. We deliver perfomance no matter where you are.",
      },
    },
  ],
];

export function Testimonials() {
  return (
    <section
      id="testimonials"
      aria-label="What our customers are saying"
      className="py-10"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 md:px-7">
        <div className="mx-auto md:text-center">
          <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-gray-300 sm:text-6xl">
            Blazing Fast Performance
          </h1>
          <h1 className="text-4xl">⚡️</h1>
          <h1 className="mx-auto max-w-4xl font-display text-4xl font-bold tracking-normal text-gray-300 sm:text-6xl">
            Web 3.0 Technology
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg sm:text-gray-400  text-gray-500 leading-7">
            {`Solana's fastest NFT API`}
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:gap-8 lg:mt-16 lg:max-w-none lg:grid-cols-1"
        >
          {testimonials.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-6 sm:gap-y-8">
                {column.map((testimonial, testimonialIndex) => (
                  <li
                    key={testimonialIndex}
                    className="hover:scale-105 transition duration-300 ease-in-out "
                  >
                    <a href={testimonial.link} target="_blank" rel="noreferrer">
                      <figure className="relative rounded-2xl bg-gray-600 p-6 shadow-xl shadow-slate-900/10">
                        <blockquote className="relative">
                          <p className="text-lg tracking-tight text-center text-white">
                            {testimonial.content}
                          </p>
                        </blockquote>
                        <figcaption className="relative mt-6 flex items-center justify-center border-t border-slate-100 pt-6">
                          <div>
                            <div className="font-display text-base text-white">
                              {testimonial.author.name}
                            </div>
                            <div className="mt-1 text-sm text-gray-400 flex justify-center items-center w-full">
                              {testimonial.author.role}
                            </div>
                          </div>
                        </figcaption>
                      </figure>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
