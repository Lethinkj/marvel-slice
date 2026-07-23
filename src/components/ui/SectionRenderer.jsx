import { useState } from 'react';
import { FiCheckCircle, FiMapPin, FiPhone, FiMail, FiBriefcase } from 'react-icons/fi';
import * as LuIcons from 'react-icons/lu';
import Button from './Button';
import Card from './Card';
import AccordionItem from './AccordionItem';
import Reveal, { Stagger, StaggerItem } from './Reveal';
import ContactForm from './ContactForm';

function DynamicIcon({ name, className }) {
  if (!name) return null;
  const IconComp = LuIcons[`Lu${name}`];
  if (!IconComp) return null;
  return <IconComp className={className} />;
}

function FaqListSection({ section }) {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <Reveal className="w-full max-w-[70%] mx-auto">
      {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</h2>}
      <div className="space-y-2">
        {(section.items || []).map((faq, i) => (
          <AccordionItem
            key={i}
            title={faq.question}
            isOpen={openIdx === i}
            onToggle={() => setOpenIdx(openIdx === i ? null : i)}
          >{faq.answer}</AccordionItem>
        ))}
      </div>
    </Reveal>
  );
}

export default function SectionRenderer({ section }) {
  switch (section.section_type) {
    case 'text':
      return (
        <Reveal className="max-w-3xl mx-auto">
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-4">{section.heading}</h2>}
          {section.content && <div className="text-text-gray text-base leading-relaxed whitespace-pre-line">{section.content}</div>}
        </Reveal>
      );
    case 'image':
      return (
        <Reveal className="max-w-4xl mx-auto text-center">
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-4">{section.heading}</h2>}
          {section.image_url && <img src={section.image_url} alt={section.heading || ''} className="w-full max-h-96 object-cover rounded-xl shadow-sm" />}
          {section.content && <p className="text-text-gray text-base mt-4">{section.content}</p>}
        </Reveal>
      );
    case 'cards':
      return (
        <div>
          {section.heading && <Reveal as="h2" className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</Reveal>}
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(section.content || '').split('\n').filter(Boolean).map((item, i) => (
              <StaggerItem key={i} className="h-full">
                <Card className="p-6">
                  {section.image_url && <img src={section.image_url} alt="" className="w-full h-40 object-cover rounded-lg mb-4" />}
                  <p className="text-dark-navy font-medium">{item}</p>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      );
    case 'features':
      return (
        <div className="max-w-3xl mx-auto">
          {section.heading && <Reveal as="h2" className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</Reveal>}
          <Stagger className="space-y-4">
            {(section.items || (section.content || '').split('\n').filter(Boolean)).map((item, i) => (
              <StaggerItem key={i} className="flex items-start gap-3">
                <FiCheckCircle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                <span className="text-text-gray text-base">{(typeof item === 'string') ? item : item.title}</span>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      );
    case 'stats_row':
      return (
        <Reveal className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
            {(section.items || []).map((stat, i) => (
              <div key={i} className="text-center px-6 py-8 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="text-[32px] sm:text-[36px] leading-tight font-extrabold text-brand-orange">{stat.number}</div>
                <div className="text-sm text-text-gray mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      );
    case 'team_grid':
      return (
        <div>
          {section.heading && <Reveal as="h2" className="text-xl sm:text-2xl font-bold text-dark-navy mb-8 text-center">{section.heading}</Reveal>}
          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {(section.items || []).map((member, i) => (
              <StaggerItem key={i} className="h-full">
                <Card className="p-6 text-center h-full">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-brand-blue to-brand-orange flex items-center justify-center text-white text-2xl font-bold mb-3 overflow-hidden">
                    {member.image_url ? <img src={member.image_url} alt={member.name} className="w-full h-full object-cover" /> : (member.name?.[0] || '?')}
                  </div>
                  <h3 className="font-bold text-dark-navy">{member.name}</h3>
                  <p className="text-sm text-brand-orange font-medium mt-0.5">{member.role}</p>
                  {member.bio && <p className="text-xs text-text-gray mt-2 line-clamp-3">{member.bio}</p>}
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      );
    case 'contact_info':
      return (
        <Reveal className="max-w-lg mx-auto">
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</h2>}
          <div className="space-y-4">
            {section.address && <div className="flex items-start gap-4"><div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0"><FiMapPin className="w-5 h-5 text-brand-orange" /></div><div className="text-text-gray text-base whitespace-pre-line">{section.address}</div></div>}
            {section.phone && <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0"><FiPhone className="w-5 h-5 text-brand-orange" /></div><a href={`tel:${section.phone}`} className="text-text-gray text-base hover:text-brand-orange transition-colors">{section.phone}</a></div>}
            {section.email && <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0"><FiMail className="w-5 h-5 text-brand-orange" /></div><a href={`mailto:${section.email}`} className="text-text-gray text-base hover:text-brand-orange transition-colors">{section.email}</a></div>}
          </div>
        </Reveal>
      );
    case 'map_embed': {
      const raw = section.content || '';
      const match = raw.match(/src=["']([^"']+)["']/);
      const mapSrc = (match ? match[1] : raw).trim();
      if (!mapSrc) return null;
      return (
        <Reveal>
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-6 text-center">{section.heading}</h2>}
          <div className="max-w-5xl mx-auto rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <div className="relative w-full aspect-[16/9] max-h-[450px]">
              <iframe
                src={mapSrc}
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Map"
              />
            </div>
          </div>
        </Reveal>
      );
    }
    case 'faq_list':
      return <FaqListSection section={section} />;
    case 'positions':
      return (
        <div>
          {section.heading && <Reveal as="h2" className="text-xl sm:text-2xl font-bold text-dark-navy mb-8 text-center">{section.heading}</Reveal>}
          <Stagger className="max-w-4xl mx-auto space-y-4">
            {(section.items || []).map((pos, i) => (
              <StaggerItem key={i}>
                <Card className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-dark-navy text-lg">{pos.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-text-gray">
                      {pos.location && <span className="flex items-center gap-1"><FiMapPin className="w-3.5 h-3.5" />{pos.location}</span>}
                      {pos.type && <span className="flex items-center gap-1"><FiBriefcase className="w-3.5 h-3.5" />{pos.type}</span>}
                    </div>
                    {pos.description && <p className="text-sm text-text-gray mt-3">{pos.description}</p>}
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">Apply Now</Button>
                </Card>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      );
    case 'cta':
      return (
        <Reveal variant="scale" className="bg-gradient-to-r from-brand-blue to-brand-orange rounded-xl p-6 sm:p-8 text-center text-white">
          {section.heading && <h2 className="text-xl sm:text-2xl font-bold mb-3">{section.heading}</h2>}
          {section.content && <p className="text-white/80 text-base mb-6">{section.content}</p>}
          {section.image_url && (
            <Button to={section.image_url} variant="outline" size="lg">
              {section.heading || 'Learn More'}
            </Button>
          )}
        </Reveal>
      );
    case 'feature_grid':
      if (!section.items?.length) return null;
      return (
        <div className="bg-bg-light py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {section.heading && (
              <Reveal as="div" className="text-center mb-6">
                <h2 className="text-[32px] sm:text-[36px] font-bold text-dark-navy">{section.heading}</h2>
                <div className="w-[60px] h-[3px] bg-brand-orange rounded-full mx-auto mt-3" />
              </Reveal>
            )}
            {section.subheading && (
              <Reveal as="p" className="text-text-gray text-base text-center max-w-[700px] mx-auto leading-relaxed">
                {section.subheading}
              </Reveal>
            )}
            <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 sm:mt-16">
              {section.items.map((item, i) => (
                <StaggerItem key={i} className="h-full">
                  <Card className="p-8 text-center h-full rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-4">
                      <DynamicIcon name={item.icon} className="w-7 h-7 text-brand-orange" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-dark-navy mb-2">{item.title}</h3>
                    <p className="text-sm text-text-gray leading-[1.5]">{item.description}</p>
                  </Card>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      );
    case 'content_media_list':
      return (
        <Reveal>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              {section.heading && <h2 className="text-xl sm:text-2xl font-bold text-dark-navy mb-4">{section.heading}</h2>}
              {section.content && <p className="text-text-gray text-base leading-relaxed mb-4">{section.content}</p>}
              {section.list_items?.length > 0 && (
                <ul className="space-y-2">
                  {section.list_items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <FiCheckCircle className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                      <span className="text-text-gray">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {section.image_url && (
              <div className="flex justify-center">
                <img src={section.image_url} alt={section.heading || ''} className="w-full max-w-md rounded-xl shadow-sm border border-gray-100" />
              </div>
            )}
          </div>
        </Reveal>
      );
    case 'contact_form':
      return <ContactForm />;
    default:
      return null;
  }
}
