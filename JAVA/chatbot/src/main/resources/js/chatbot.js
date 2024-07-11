AJS.toInit(function() {
  AJS.$("#chatbot-header").on("click", function() {
    AJS.$("#chatbot-container").toggle();
  });

  AJS.$("#chatbot-close").on("click", function() {
    AJS.$("#chatbot-container").hide();
  });
});
