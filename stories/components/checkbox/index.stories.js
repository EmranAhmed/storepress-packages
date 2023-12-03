import { Checkbox } from '../../../components/index';


export default {
    title: 'Checkbox',
    component: Checkbox,
    parameters: {
        // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
        layout: 'centered',
    },
    // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
    tags: ['autodocs'],
    // More on argTypes: https://storybook.js.org/docs/api/argtypes
};


export const Primary = {
    args: {
        label: "Hello",
        checked: false,
        onChange: ()=>{},
    }
};