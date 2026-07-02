export default function CertificationSection({ section }) {
  if (!section) return null;

  const heading = section.heading || 'Certification';
  const content = section.content || {};
  const description = content.description || '';
  const imageUrl = content.image_url || '';
  const companies = (content.companies || '').split('\n').filter(Boolean);

  if (!description && !imageUrl) return null;

  return (
    <section className="py-16 bg-bg-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[clamp(1.5rem,3vw,2.25rem)] font-bold text-center text-dark-navy mb-10">
          {heading}
        </h2>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            {description && (
              <p className="text-text-gray text-base leading-relaxed">{description}</p>
            )}
            {companies.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-dark-navy mb-4">Recognized By</h4>
                <div className="flex flex-wrap gap-3">
                  {companies.map((c, i) => (
                    <span key={i} className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-dark-navy">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {imageUrl && (
            <div className="flex justify-center">
              <img src={imageUrl} alt="Certification" className="max-w-sm rounded-xl shadow-sm" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
