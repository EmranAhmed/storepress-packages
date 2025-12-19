/**
 * External dependencies
 */
import { useEffect } from '@storybook/addons';
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

            StorePressTooltip.init()

            return ()=> {
              StorePressTooltip.destroy()
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
            <div style={{'width': 'max-content'}} data-storepress-tooltip="Distinctively">Text</div>
            <div style={{'width': 'max-content'}} data-storepress-tooltip="Conveniently exploit enabled web services.">Data 2</div>
            <button style={{'width': 'max-content'}} data-storepress-tooltip="Seamlessly predominate web-enabled strategic theme areas after world-class e-services.">Button</button>
          </>
        );
    }
}

export const Image = {

  render : (args) => {
    return (
      <>
        <div className="storepress-tooltip-type-image" style={{ '--tooltip-image':'url(\'https://picsum.photos/300/200\')'}} data-storepress-tooltip="Sample">Image Tooltip</div>
        <div className="storepress-tooltip-type-image" style={{ '--tooltip-image':'url(\'https://picsum.photos/150\')'}} data-storepress-tooltip="Long tooltip text with strategic">Image Tooltip</div>
      </>
    );
  }
}