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
#'   ajaxfields::draw("some-namespace","http://ncbi.post.host/url/")
#'   ..
#' )
#'
#' @param id namespace
#' @param host post db host
#' @param label html component label
#' @export
draw <- function(id, host, label) {
  ns <- shiny::NS(id)

  shiny::div(id = ns('ajaxfields'), class = "form-group ajaxfields-container",
    shiny::tags$label(label),
    shiny::tags$input(type="text", class="form-control ajaxfields-input", onkeyup=paste0("ajaxfields.onkeyup(this, '", ns('ajaxfields'), "')")),
    shiny::div(class="form-control ajaxfields-list"),
    shiny::tags$script(shiny::HTML(
      paste0("ajaxfields.load('", ns('ajaxfields'), "', '", host, "')")
    )),
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
