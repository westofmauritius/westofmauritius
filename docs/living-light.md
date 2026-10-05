# Living light

The site's tints follow the real time of day in Tamarin
(`src/lib/light.ts`). A tiny script in the page head works out the phase
before the first paint and sets `<html data-light="…">`; a small client
component checks again every five minutes. Without JavaScript the daytime
values stay.

| Phase   | When (Tamarin time)                                     |
| ------- | ------------------------------------------------------- |
| morning | 30 minutes before sunrise to 2½ hours after             |
| day     | until 20 minutes before the golden light                |
| golden  | from then until sunset (the sun 6 degrees up and lower) |
| dusk    | sunset to 45 minutes after                              |
| night   | the rest                                                |

What changes, subtly: the accent colour (eyebrows, accent words), its light
version on dark backgrounds, the wash at the top of each page and the deep
shade of the homepage hero. The 3D map's sunlight follows the phase too
(low and warm from the sea at golden hour).

## Contrast (WCAG 2.2 AA)

Checked against every light background the accent can sit on (cream page,
sand 50 and 100, lagoon 50, coral 50 and the phase's own wash) and the dark
ones (the phase's hero shade, ocean 900).

| Phase   | Accent  | Lowest on light | On dark | Lowest on dark | Hero eyebrow on the photo (360 px phone) |
| ------- | ------- | --------------- | ------- | -------------- | ---------------------------------------- |
| morning | #a63f28 | 4.90            | #ffb59e | 8.71           | 7.57                                     |
| day     | #b13521 | 4.85            | #ffa58f | 7.77           | 6.95                                     |
| golden  | #a3420f | 4.93            | #ffbe7a | 9.09           | 8.21                                     |
| dusk    | #a3345a | 5.16            | #f5a9c4 | 8.00           | 7.16                                     |
| night   | #97384f | 5.51            | #c9b8f2 | 8.19           | 8.04                                     |

Small text needs 4.5, large text 3.
