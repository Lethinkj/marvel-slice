import { Tab } from '@headlessui/react';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Tabs({ tabs, panels, className = '' }) {
  return (
    <div className={className}>
      <Tab.Group>
        <Tab.List className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-px">
          {tabs.map((tab) => (
            <Tab
              key={tab}
              className={({ selected }) =>
                classNames(
                  'px-6 py-3 text-base font-medium rounded-t-lg transition-colors outline-none',
                  selected
                    ? 'bg-brand-purple text-white shadow-sm'
                    : 'text-text-gray hover:text-brand-blue hover:bg-gray-100'
                )
              }
            >
              {tab}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-8">
          {panels.map((panel, idx) => (
            <Tab.Panel key={idx}>{panel}</Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
