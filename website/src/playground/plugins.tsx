import { NanointlPlugin } from 'nanointl/makeIntl';
import { FunctionalComponent } from 'preact';
import { numberPlugin } from 'nanointl/number';
import { dateTimePlugin } from 'nanointl/datetime';
import { markdownPlugin } from 'nanointl/markdown';
import { tagsPlugin } from 'nanointl/tags';
import { Transition } from '@headlessui/react';
import cx from 'classnames';

const allPlugins = [numberPlugin, dateTimePlugin, markdownPlugin, tagsPlugin];

export const Plugins: FunctionalComponent<{
  plugins: NanointlPlugin<any>[];
  onPluginsChange: (plugins: NanointlPlugin<any>[]) => void;
}> = ({ plugins, onPluginsChange }) => {
  return (
    <div>
      <label className="text-xs text-gray-400">Plugins</label>
      <div className="flex">
        {allPlugins.map((plugin) => {
          const label = plugin.name.split('-').slice(0, -1).join('-');
          const checked = plugins.includes(plugin);
          const handleClick = () => onPluginsChange(checked ? plugins.filter((p) => p !== plugin) : [...plugins, plugin]);

          return (
            <div
              key={plugin.name}
              className={
                'flex items-center cursor-pointer p-1 px-2 border first:border-l border-l-0 first:rounded-l last:rounded-r hover:bg-white/10 transition'
              }
              onClick={handleClick}
            >
              <div className={cx('rounded-full border h-3 w-3 mr-1 mt-1 relative transition', checked && `scale-125`)}>
                <Transition
                  show={checked}
                  className="absolute top-0 left-0"
                  enter="transition duration-150 ease-out"
                  enterFrom="transform opacity-0"
                  enterTo="transform opacity-100"
                  leave="transition duration-75 ease-out"
                  leaveFrom="transform opacity-100"
                  leaveTo="transform opacity-0"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-4 h-4 relative -top-1 -left-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Transition>
              </div>
              <span>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
