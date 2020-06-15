dependency <- function() {
  htmltools::htmlDependency(
    "ajaxfields",
    packageVersion('ajaxfields'),
    src = c(file = "www"),
    package = "ajaxfields",
    script = "ajaxfields.js",
    stylesheet = "ajaxfields.css",
    all_files = FALSE
  )
}

#' draw search input and options list
#'
#' ui <- fluidPage(
#'   ..
#'   ajaxfields::draw("some-namespace", "label")
#'   ..
#' )
#'
#' @param id namespace
#' @param label html component label
#' @export
draw <- function(id, label) {
  ns <- shiny::NS(id)

  shiny::div(id = ns('ajaxfields'), class = "form-group ajaxfields-container",
    shiny::tags$label(label),
    shiny::tags$input(type="text", class="form-control ajaxfields-input", onkeyup=paste0("ajaxfields.onkeyup(this, '", ns('ajaxfields'), "')")),
    shiny::div(class="form-control ajaxfields-list"),
    dependency()
  )
}

#' shiny server (module) function
#'
#' server <- function(input, output, session) {
#'   ..
#'   data <- callModule(ajaxfields::observer, "some-namespace")
#'   ..
#' }
#'
#' @param input unused
#' @param output unused
#' @param session unused
#' @return reactive list
#' @export
observer <- function(input, output, session) {
  shiny::reactive(input$ajaxfields)
}

#' shiny server load modules engine
#'
#' server <- function(input, output, session) {
#'   ..
#'   ajaxfields::loadEngine(session, "some-namespace", "simle", ""http://ncbi.post.host/url/")
#'   ajaxfields::loadEngine(session, "some-other-namespace", "es", "http://elastic.seach:9200/indexName/")
#'   ..
#' }
#'
#' @param session shiny server session
#' @param id namespace
#' @param engine engine type (simple/es)
#' @param url engine url
#' @export
loadEngine <- function(session, id, engine, url) {
  ns <- shiny::NS(id)
  session$sendCustomMessage("ajaxfields", list(
    ns = ns('ajaxfields'), engine = engine, url = url
  ))
}
