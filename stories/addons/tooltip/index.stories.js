/**
 * External dependencies
 */
import { useEffect } from '@storybook/addons';
import { triggerEvent } from '@storepress/utils';
import StorePressTooltip from '@storepress/tooltip';
/**
 * Internal dependencies
 */

import '@storepress/tooltip/src/style.scss';

export default {
    title      : 'Addons/Tooltip',
    // component  : StorePressTooltip,
    /*parameters : {
        controls : {expanded : true},
    }*/
    parameters:{
        /*controls:{
            disabled: true,
        },*/
        options: { showPanel: false }
    },

    decorators: [
        (Story) => {

          useEffect(() => {
            StorePressTooltip();
            triggerEvent(document, 'storepress_tooltip_init')

            return ()=> {
              triggerEvent(document, 'storepress_tooltip_destroy')
            }
          }, []);

      return (
          <div style={{ margin: '3rem', 'display': 'flex', 'gap': 5 }}>
              {/* 👇 Decorators in Storybook also accept a function. Replace <Story/> with Story() to enable it  */}
              <Story />
          </div>
        )},
    ],
};

export const Basic = {

    render : (args) => {
        return (
          <>
            <div style={{'width': 'max-content'}} data-storepress-tooltip="Distinctively">Data</div>
            <div style={{'width': 'max-content'}} data-storepress-tooltip="Synergistically leverage existing diverse sources for B2B metrics. Seamlessly predominate web-enabled strategic theme areas after world-class e-services. Proactively productivate fully researched infomediaries and timely supply chains. Conveniently exploit enabled web services.">Data 2</div>
          </>
        );
    }
}