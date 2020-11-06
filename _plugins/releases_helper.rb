# module Jekyll
#   class ReleasesHelper < ReleasesHelper
#     # Checks whether the specified series or release contain a reference to the given connector name.
#     #
#     # @param connector_name the name of the connector
#     # @param series the series object, may be nil
#     # @param release the release object, may be nil
#     #
#     # @return true if connector_name found in the connector list, false otherwise
#     def has_connector(connector_name, series, release)
#       if !release.nil? && !release.connectors.nil?
#         if release.connectors.include?(connector_name)
#           return true
#         end
#       end
#       if !series.nil? && !series.connectors.nil?
#         if series.connectors.include?(connector_name)
#           return true
#         end
#       end
#       return false
#     end
#   end
# end
# module Jekyll
#   class ReleasesHelper < Helper
#     safe true
#     priority :low
#     def has_connector(connector_name, series, release)
#       if !release.nil? && !release.connectors.nil?
#         if release.connectors.include?(connector_name)
#           return true
#         end
#       end
#       if !series.nil? && !series.connectors.nil?
#         if series.connectors.include?(connector_name)
#           return true
#         end
#       end
#       return false
#     end
#   end
# end