import {
    AnimationEntryMetadata,
    animate,
    state,
    style,
    transition,
    trigger
} from "@angular/core";

export const animations: Array<AnimationEntryMetadata> = [
    trigger('flyInOut', [
        state('in', style({transform: 'none'})),
        transition('void => *', [
          style({transform: 'translateX(-100%)'}),
          animate(300)
        ]),
        transition('* => void', [
          animate(300, style({transform: 'translateX(100%)', height: 0, opacity: 0}))
        ])
      ])
];
