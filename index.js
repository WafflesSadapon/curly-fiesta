// index.js
(() => {
  const { findByProps } = vendetta.metro;
  const { instead } = vendetta.patcher;
  const { showToast } = vendetta.ui.toasts;

  const Reactions = findByProps("addReaction", "removeReaction");
  const Sheets = findByProps("hideActionSheet", "hideAllActionSheets");
  const PICKER = Reactions.ReactionLocations.MESSAGE_REACTION_PICKER;

  const patches = [];
  let holdOpenUntil = 0;

  return {
    onLoad() {
      patches.push(instead("addReaction", Reactions, (args, orig) => {
        if (args.includes(PICKER)) holdOpenUntil = Date.now() + 500;
        return orig(...args);
      }));
      for (const fn of ["hideActionSheet", "hideAllActionSheets"]) {
        patches.push(instead(fn, Sheets, (args, orig) => {
          if (Date.now() < holdOpenUntil) {
            showToast("blocked " + fn);
            return;
          }
          return orig(...args);
        }));
      }
    },
    onUnload() {
      patches.forEach((u) => u());
    },
  };
})();