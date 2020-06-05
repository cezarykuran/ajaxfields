dependency <- function() {
  htmltools::htmlDependency(
    "ajaxfields",
    packageVersion('ajaxfields'),
    src = "www",
    package = "ajaxfields",
    script = "ajaxfields.js",
    stylesheet = "ajaxfields.css",
    all_files = FALSE
  )
}

#' draw search input and options list
#'
#' @param id namespace
#' @param host post db host
#' @param label
#' @export
#' @examples
#'  ui <- fluidPage(
#'    ..
#'    ajaxfields::draw("some-namespace","http://ncbi.post.host/url/")
#'    ..
#'  )
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
#' @return reactive data
#' @export
#'
#' @examples
#'  server <- function(input, output, session) {
#'    ..
#'    data <- callModule(ajaxfields::observer, "some-namespace")
#'    ..
#'  }
observer <- function(input, output, session) {
    reactive(input$ajaxfields)
}
