export default function ReviewsSection() {
const reviews = [
{
name: "Priya Sharma",
role: "Frontend Contributor",
avatar: "PS",
review:
"DevPath helped me make my first open-source contribution. The community was welcoming and supportive throughout my journey.",
},
{
name: "Rahul Patil",
role: "Student Developer",
avatar: "RP",
review:
"The discussions are extremely helpful and motivating. I've learned more here than from many paid courses.",
},
{
name: "Aarav Singh",
role: "Full Stack Developer",
avatar: "AS",
review:
"I found project teammates, improved my skills, and gained confidence by collaborating with other developers.",
},
];

return ( <section
   id="reviews"
   className="relative py-24 overflow-hidden"
 >
{/* Background Glow */} <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

```
  <div className="container mx-auto px-4 max-w-7xl relative z-10">

    {/* Heading */}
    <div className="text-center mb-16">
      <span className="inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1 text-sm text-cyan-400 mb-4">
        ⭐ Community Feedback
      </span>

      <h2 className="text-5xl font-bold mb-5 bg-gradient-to-r from-white via-cyan-300 to-cyan-500 bg-clip-text text-transparent">
        Loved by Developers
      </h2>

      <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
        Discover how learners, contributors, and developers are growing
        together through DevPath's collaborative community.
      </p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 text-center">
        <h3 className="text-4xl font-bold text-cyan-400 mb-2">
          4.9★
        </h3>
        <p className="text-muted-foreground">
          Average Rating
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 text-center">
        <h3 className="text-4xl font-bold text-cyan-400 mb-2">
          500+
        </h3>
        <p className="text-muted-foreground">
          Active Developers
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 text-center">
        <h3 className="text-4xl font-bold text-cyan-400 mb-2">
          120+
        </h3>
        <p className="text-muted-foreground">
          Positive Reviews
        </p>
      </div>
    </div>

    {/* Reviews */}
    <div className="grid md:grid-cols-3 gap-8">
      {reviews.map((review, index) => (
        <div
          key={index}
          className="group rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-8 transition-all duration-300 hover:-translate-y-2 hover:border-cyan-500/40 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]"
        >
          <div className="text-cyan-400 text-4xl mb-4">
            ❝
          </div>

          <div className="text-yellow-400 mb-4 text-lg">
            ⭐⭐⭐⭐⭐
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8">
            {review.review}
          </p>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center font-semibold text-white">
              {review.avatar}
            </div>

            <div>
              <h4 className="font-semibold text-lg">
                {review.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {review.role}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Bottom Trust Line */}
    <div className="text-center mt-16">
      <p className="text-muted-foreground">
        Trusted by learners, contributors, and developers across the community.
      </p>
    </div>
  </div>
</section>

);
}
