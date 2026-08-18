-- Attaches real product-page urls found via web search, for the seeded
-- series where a single, unambiguous official page could be confirmed.
-- Left blank (on purpose, still) for series whose seeded title doesn't
-- correspond to one verifiable real product, or where the instructor has
-- several same-topic products and picking one would be a guess -- see the
-- chat writeup for the per-series confidence notes. A video's url mirrors
-- its series' url since these platforms gate every volume behind one
-- product page rather than per-volume pages.

update instructionals set url = 'https://bjjfanatics.com/products/enter-the-system-bundle-by-john-danaher'
  where title = 'Enter the System' and instructor = 'John Danaher';

update instructionals set url = 'https://bjjfanatics.com/products/go-further-faster-bundle-by-john-danher'
  where title = 'Go Further Faster' and instructor = 'John Danaher';

update instructionals set url = 'https://bjjfanatics.com/products/guard-retention-bjj-fundamentals-go-further-faster-by-john-danaher'
  where title = 'The Guard Retention Formula' and instructor = 'John Danaher';

update instructionals set url = 'https://bjjfanatics.com/products/back-attacks-enter-the-system-by-john-danaher'
  where title = 'Back Attacks' and instructor = 'John Danaher';

update instructionals set url = 'https://bjjfanatics.com/products/systematically-attacking-the-guard-by-gordon-ryan'
  where title = 'Systematically Attacking the Guard' and instructor = 'Gordon Ryan';

update instructionals set url = 'https://bjjfanatics.com/products/the-marcelo-x-guard-by-marcelo-garcia'
  where title = 'X-Guard Sweeps and Attacks' and instructor = 'Marcelo Garcia';

update instructional_videos v
  set url = i.url
  from instructionals i
  where v.instructional_id = i.id and i.url is not null;
