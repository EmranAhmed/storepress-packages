/**
 * WordPress dependencies
 */
import { useState, Fragment } from '@wordpress/element';
import { Icon } from '@wordpress/icons';
/**
 * Internal dependencies
 */

import { archiveProduct, storepress, slider } from '../../icons';
import * as icons from '../../icons';

export default {
    title      : 'StorePress Icons',
    component  : Icon,
    parameters : {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout   : 'centered',
        controls : {
            hideNoControlsWarning : true
        },
    },
    // tags       : ['autodocs'],

};

export const AvailableIcons = {
    parameters : {
        controls : {
            hideNoControlsWarning : true
        },
        docs     : {
            source : {
                code : null,
            },
        },
    },
    argTypes   : {
        icon : {
            options : Object.keys(icons), // An array of serializable values
            mapping : icons, // Maps serializable option values to complex arg values
            control : {
                type : 'select', // Type 'select' is automatically inferred when 'options' is defined

                labels : {
                    // 'labels' maps option values to string labels
                    storepress     : 'storepress',
                    popup          : 'popup',
                    slider         : 'slider',
                    archiveProduct : 'archiveProduct',
                },
            },
        },
        size : {
            control : 'select',
            options : [24, 36, 48]
        }
    },
    args       : {
        icon : storepress,
        size : 36,
    }
};
